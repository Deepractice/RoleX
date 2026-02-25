/**
 * Runtime — execution engine for the system graph.
 *
 * Six operations:
 *   create    — add a child node under a parent
 *   remove    — delete a node and its subtree
 *   transform — produce from one branch into another
 *   link      — establish a cross-branch relation
 *   unlink    — remove a cross-branch relation
 *   project   — read the current state
 *
 * State = Process(Structure, Information?)
 */

import type { State } from "./process.js";
import type { Structure } from "./structure.js";

// ===== Runtime interface =====

export interface Runtime {
  /** Create a child node (parent=null for root). Type is the structure template. */
  create(
    parent: Structure | null,
    type: Structure,
    information?: string,
    id?: string,
    alias?: readonly string[]
  ): Structure;

  /** Remove a node and its subtree. */
  remove(node: Structure): void;

  /** Produce a new node in target structure's branch, sourced from another branch. */
  transform(source: Structure, target: Structure, information?: string): Structure;

  /** Establish a bidirectional cross-branch relation between two nodes. */
  link(from: Structure, to: Structure, relation: string, reverse: string): void;

  /** Remove a bidirectional cross-branch relation between two nodes. */
  unlink(from: Structure, to: Structure, relation: string, reverse: string): void;

  /** Set a tag on a node (e.g., "done", "abandoned"). */
  tag(node: Structure, tag: string): void;

  /** Project the current state of a node and its subtree (including links). */
  project(node: Structure): State;

  /** Return all root nodes (nodes without a parent edge). */
  roots(): Structure[];
}

// ===== In-memory implementation =====

interface TreeNode {
  node: Structure;
  parent: string | null;
  children: string[];
}

interface LinkEntry {
  toId: string;
  relation: string;
}

export const createRuntime = (): Runtime => {
  const nodes = new Map<string, TreeNode>();
  const links = new Map<string, LinkEntry[]>();
  let counter = 0;
  const nextRef = () => `e${++counter}`;

  const findByStructure = (structure: Structure): TreeNode | undefined => {
    for (const treeNode of nodes.values()) {
      if (treeNode.node.name === structure.name) return treeNode;
    }
    return undefined;
  };

  const removeSubtree = (ref: string): void => {
    const treeNode = nodes.get(ref);
    if (!treeNode) return;
    for (const childRef of [...treeNode.children]) {
      removeSubtree(childRef);
    }
    // Clean up links from this node
    links.delete(ref);
    // Clean up links to this node
    for (const [fromRef, fromLinks] of links.entries()) {
      const filtered = fromLinks.filter((l) => l.toId !== ref);
      if (filtered.length === 0) {
        links.delete(fromRef);
      } else {
        links.set(fromRef, filtered);
      }
    }
    nodes.delete(ref);
  };

  const projectRef = (ref: string): State => {
    const treeNode = nodes.get(ref)!;
    return { ...treeNode.node, children: [] };
  };

  const projectNode = (ref: string): State => {
    const treeNode = nodes.get(ref)!;
    const nodeLinks = links.get(ref);
    return {
      ...treeNode.node,
      children: treeNode.children.map(projectNode),
      ...(nodeLinks && nodeLinks.length > 0
        ? {
            links: nodeLinks.map((l) => ({
              relation: l.relation,
              target: projectRef(l.toId),
            })),
          }
        : {}),
    };
  };

  const createNode = (
    parentRef: string | null,
    type: Structure,
    information?: string,
    id?: string,
    alias?: readonly string[]
  ): Structure => {
    const ref = nextRef();
    const node: Structure = {
      ref,
      ...(id ? { id } : {}),
      ...(alias && alias.length > 0 ? { alias } : {}),
      name: type.name,
      description: type.description,
      parent: type.parent,
      information,
    };
    const treeNode: TreeNode = { node, parent: parentRef, children: [] };
    nodes.set(ref, treeNode);

    if (parentRef) {
      const parentTreeNode = nodes.get(parentRef);
      if (!parentTreeNode) throw new Error(`Parent not found: ${parentRef}`);
      parentTreeNode.children.push(ref);
    }

    return node;
  };

  return {
    create(parent, type, information, id, alias) {
      return createNode(parent?.ref ?? null, type, information, id, alias);
    },

    remove(node) {
      if (!node.ref) return;
      const treeNode = nodes.get(node.ref);
      if (!treeNode) return;

      if (treeNode.parent) {
        const parentTreeNode = nodes.get(treeNode.parent);
        if (parentTreeNode) {
          parentTreeNode.children = parentTreeNode.children.filter((r) => r !== node.ref);
        }
      }

      removeSubtree(node.ref);
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

      return createNode(parentTreeNode.node.ref!, target, information);
    },

    link(from, to, relationName, reverseName) {
      if (!from.ref) throw new Error("Source node has no ref");
      if (!to.ref) throw new Error("Target node has no ref");

      // Forward: from → to
      const fromLinks = links.get(from.ref) ?? [];
      if (!fromLinks.some((l) => l.toId === to.ref && l.relation === relationName)) {
        fromLinks.push({ toId: to.ref, relation: relationName });
        links.set(from.ref, fromLinks);
      }

      // Reverse: to → from
      const toLinks = links.get(to.ref) ?? [];
      if (!toLinks.some((l) => l.toId === from.ref && l.relation === reverseName)) {
        toLinks.push({ toId: from.ref, relation: reverseName });
        links.set(to.ref, toLinks);
      }
    },

    unlink(from, to, relationName, reverseName) {
      if (!from.ref || !to.ref) return;

      // Forward
      const fromLinks = links.get(from.ref);
      if (fromLinks) {
        const filtered = fromLinks.filter(
          (l) => !(l.toId === to.ref && l.relation === relationName)
        );
        if (filtered.length === 0) links.delete(from.ref);
        else links.set(from.ref, filtered);
      }

      // Reverse
      const toLinks = links.get(to.ref);
      if (toLinks) {
        const filtered = toLinks.filter(
          (l) => !(l.toId === from.ref && l.relation === reverseName)
        );
        if (filtered.length === 0) links.delete(to.ref);
        else links.set(to.ref, filtered);
      }
    },

    tag(node, tagValue) {
      if (!node.ref) throw new Error("Node has no ref");
      const treeNode = nodes.get(node.ref);
      if (!treeNode) throw new Error(`Node not found: ${node.ref}`);
      (treeNode.node as any).tag = tagValue;
    },

    project(node) {
      if (!node.ref || !nodes.has(node.ref)) {
        throw new Error(`Node not found: ${node.ref}`);
      }
      return projectNode(node.ref);
    },

    roots() {
      const result: Structure[] = [];
      for (const treeNode of nodes.values()) {
        if (treeNode.parent === null) {
          result.push(treeNode.node);
        }
      }
      return result;
    },
  };
};
