/**
 * Graph-backed runtime — implements system Runtime using graphology.
 *
 * Mapping:
 *   Structure instance  →  graph node (key = id, attributes = type/description/info)
 *   Parent-child        →  directed edge with type "child"
 *   Relation (link)     →  directed edge with relation name as type
 *
 * Advantages over raw Map storage:
 *   - dropNode auto-cleans all connected edges (no manual link cleanup)
 *   - graph traversal is native
 *   - serialization/persistence built-in (graphology ecosystem)
 */
import { DirectedGraph } from "graphology";
import type { Structure } from "@rolexjs/system";
import type { State, Runtime } from "@rolexjs/system";

interface NodeAttributes {
  type: string;
  description: string;
  parent: Structure | null;
  information?: string;
}

interface EdgeAttributes {
  type: string; // "child" for tree edges, relation name for cross-branch
}

export const createGraphRuntime = (): Runtime => {
  const graph = new DirectedGraph<NodeAttributes, EdgeAttributes>();
  let counter = 0;
  const nextId = () => `n${++counter}`;

  const collectSubtree = (id: string): string[] => {
    const ids: string[] = [id];
    graph.forEachOutEdge(id, (_edge, attrs, _source, target) => {
      if (attrs.type === "child") {
        ids.push(...collectSubtree(target));
      }
    });
    return ids;
  };

  const projectNode = (id: string): State => {
    const attrs = graph.getNodeAttributes(id);
    const children: State[] = [];
    const links: { relation: string; target: State }[] = [];

    graph.forEachOutEdge(id, (_edge, edgeAttrs, _source, target) => {
      if (edgeAttrs.type === "child") {
        children.push(projectNode(target));
      } else {
        links.push({
          relation: edgeAttrs.type,
          target: projectNode(target),
        });
      }
    });

    return {
      id,
      name: attrs.type,
      description: attrs.description,
      parent: attrs.parent,
      ...(attrs.information ? { information: attrs.information } : {}),
      children,
      ...(links.length > 0 ? { links } : {}),
    };
  };

  const createNode = (
    parentId: string | null,
    type: Structure,
    information?: string
  ): Structure => {
    const id = nextId();

    graph.addNode(id, {
      type: type.name,
      description: type.description,
      parent: type.parent,
      information,
    });

    if (parentId) {
      if (!graph.hasNode(parentId)) throw new Error(`Parent not found: ${parentId}`);
      graph.addDirectedEdge(parentId, id, { type: "child" });
    }

    return {
      id,
      name: type.name,
      description: type.description,
      parent: type.parent,
      information,
    };
  };

  return {
    create(parent, type, information) {
      return createNode(parent?.id ?? null, type, information);
    },

    remove(node) {
      if (!node.id || !graph.hasNode(node.id)) return;

      // Collect subtree first, then drop leaves-first
      const subtreeIds = collectSubtree(node.id);

      // Detach from parent
      graph.forEachInEdge(node.id, (edge, attrs) => {
        if (attrs.type === "child") graph.dropEdge(edge);
      });

      // Drop all nodes (graphology auto-cleans connected edges)
      for (const id of subtreeIds.reverse()) {
        graph.dropNode(id);
      }
    },

    transform(_source, target, information) {
      const targetParent = target.parent;
      if (!targetParent) {
        throw new Error(`Cannot transform to root structure: ${target.name}`);
      }

      let parentId: string | undefined;
      graph.forEachNode((id, attrs) => {
        if (!parentId && attrs.type === targetParent.name) {
          parentId = id;
        }
      });

      if (!parentId) {
        throw new Error(`No node found for structure: ${targetParent.name}`);
      }

      return createNode(parentId, target, information);
    },

    link(from, to, relation) {
      if (!from.id) throw new Error("Source node has no id");
      if (!to.id) throw new Error("Target node has no id");

      // Idempotent
      let exists = false;
      graph.forEachOutEdge(from.id, (_edge, attrs, _source, target) => {
        if (target === to.id && attrs.type === relation) exists = true;
      });
      if (exists) return;

      graph.addDirectedEdge(from.id, to.id, { type: relation });
    },

    unlink(from, to, relation) {
      if (!from.id || !to.id) return;

      let edgeToRemove: string | undefined;
      graph.forEachOutEdge(from.id, (edge, attrs, _source, target) => {
        if (target === to.id && attrs.type === relation) edgeToRemove = edge;
      });

      if (edgeToRemove) graph.dropEdge(edgeToRemove);
    },

    project(node) {
      if (!node.id || !graph.hasNode(node.id)) {
        throw new Error(`Node not found: ${node.id}`);
      }
      return projectNode(node.id);
    },
  };
};
