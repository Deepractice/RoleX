/**
 * Runtime — execution engine for the system tree.
 *
 * Four operations:
 *   create    — add a child node under a parent
 *   remove    — delete a node and its subtree
 *   transform — produce from one branch into another
 *   project   — read the current state
 *
 * State = Process(Structure, Information?)
 */
import type { Structure } from "./structure.js";
import type { State } from "./process.js";

// ===== Runtime interface =====

export interface Runtime {
  /** Create a child node (parent=null for root). Type is the structure template. */
  create(parent: Structure | null, type: Structure, information?: string): Structure;

  /** Remove a node and its subtree. */
  remove(node: Structure): void;

  /** Produce a new node in target structure's branch, sourced from another branch. */
  transform(source: Structure, target: Structure, information?: string): Structure;

  /** Project the current state of a node and its subtree. */
  project(node: Structure): State;
}

// ===== In-memory implementation =====

interface TreeNode {
  node: Structure;
  parent: string | null;
  children: string[];
}

export const createRuntime = (): Runtime => {
  const nodes = new Map<string, TreeNode>();
  let counter = 0;
  const nextId = () => `e${++counter}`;

  const findByStructure = (structure: Structure): TreeNode | undefined => {
    for (const treeNode of nodes.values()) {
      if (treeNode.node.name === structure.name) return treeNode;
    }
    return undefined;
  };

  const removeSubtree = (id: string): void => {
    const treeNode = nodes.get(id);
    if (!treeNode) return;
    for (const childId of [...treeNode.children]) {
      removeSubtree(childId);
    }
    nodes.delete(id);
  };

  const projectNode = (id: string): State => {
    const treeNode = nodes.get(id)!;
    return {
      ...treeNode.node,
      children: treeNode.children.map(projectNode),
    };
  };

  const createNode = (
    parentId: string | null,
    type: Structure,
    information?: string,
  ): Structure => {
    const id = nextId();
    const node: Structure = {
      id,
      name: type.name,
      description: type.description,
      parent: type.parent,
      information,
    };
    const treeNode: TreeNode = { node, parent: parentId, children: [] };
    nodes.set(id, treeNode);

    if (parentId) {
      const parentTreeNode = nodes.get(parentId);
      if (!parentTreeNode) throw new Error(`Parent not found: ${parentId}`);
      parentTreeNode.children.push(id);
    }

    return node;
  };

  return {
    create(parent, type, information) {
      return createNode(parent?.id ?? null, type, information);
    },

    remove(node) {
      if (!node.id) return;
      const treeNode = nodes.get(node.id);
      if (!treeNode) return;

      if (treeNode.parent) {
        const parentTreeNode = nodes.get(treeNode.parent);
        if (parentTreeNode) {
          parentTreeNode.children = parentTreeNode.children.filter(id => id !== node.id);
        }
      }

      removeSubtree(node.id);
    },

    transform(_source, target, information) {
      const targetParent = target.parent;
      if (!targetParent) {
        throw new Error(`Cannot transform to root structure: ${target.name}`);
      }

      const parentTreeNode = findByStructure(targetParent);
      if (!parentTreeNode) {
        throw new Error(`No node found for structure: ${targetParent.name}`);
      }

      return createNode(parentTreeNode.node.id!, target, information);
    },

    project(node) {
      if (!node.id || !nodes.has(node.id)) {
        throw new Error(`Node not found: ${node.id}`);
      }
      return projectNode(node.id);
    },
  };
};
