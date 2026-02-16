/**
 * localPlatform — create a Platform backed by local filesystem.
 *
 * Storage layout:
 *   {dataDir}/graph.json — serialized graph (nodes + edges + attributes)
 *
 * Every operation reads from disk first, every mutation saves after.
 * This ensures cross-process consistency (CLI writes, MCP reads immediately).
 * When dataDir is null, runs purely in-memory (useful for tests).
 */
import { MultiDirectedGraph as DirectedGraph } from "graphology";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Platform } from "@rolexjs/core";
import type { Runtime, Structure, State } from "@rolexjs/system";
import { createResourceX, setProvider } from "resourcexjs";
import { NodeProvider } from "@resourcexjs/node-provider";

interface NodeAttributes {
  type: string;
  description: string;
  parent: Structure | null;
  information?: string;
  id?: string;
  alias?: readonly string[];
}

interface EdgeAttributes {
  type: string; // "child" for tree edges, relation name for cross-branch
}

export interface LocalPlatformConfig {
  /** Directory for persistent storage. Defaults to ~/.deepractice/rolex. Set to null for in-memory only. */
  dataDir?: string | null;
  /** Directory for ResourceX storage. Defaults to ~/.deepractice/resourcex. Set to null to disable. */
  resourceDir?: string | null;
}

/** Create a local Platform. Persistent by default (~/.deepractice/rolex), in-memory if dataDir is null. */
export function localPlatform(config: LocalPlatformConfig = {}): Platform {
  const dataDir = config.dataDir === null
    ? undefined
    : config.dataDir ?? join(homedir(), ".deepractice", "rolex");
  const graph = new DirectedGraph<NodeAttributes, EdgeAttributes>();

  // ===== Persistence =====

  let counter = 0;

  const load = () => {
    if (!dataDir) return;
    const graphPath = join(dataDir, "graph.json");
    if (existsSync(graphPath)) {
      graph.clear();
      const data = JSON.parse(readFileSync(graphPath, "utf-8"));
      graph.import(data);
      counter = 0;
      graph.forEachNode((ref) => {
        const n = parseInt(ref.slice(1), 10);
        if (n > counter) counter = n;
      });
    }
  };

  const save = () => {
    if (!dataDir) return;
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(
      join(dataDir, "graph.json"),
      JSON.stringify(graph.export(), null, 2),
      "utf-8",
    );
  };

  const nextRef = () => `n${++counter}`;

  // ===== Graph operations =====

  const collectSubtree = (ref: string): string[] => {
    const refs: string[] = [ref];
    graph.forEachOutEdge(ref, (_edge, attrs, _source, target) => {
      if (attrs.type === "child") {
        refs.push(...collectSubtree(target));
      }
    });
    return refs;
  };

  const projectNodeRef = (ref: string): State => {
    const attrs = graph.getNodeAttributes(ref);
    return {
      ref,
      ...(attrs.id ? { id: attrs.id } : {}),
      ...(attrs.alias && attrs.alias.length > 0 ? { alias: attrs.alias } : {}),
      name: attrs.type,
      description: attrs.description,
      parent: attrs.parent,
      ...(attrs.information ? { information: attrs.information } : {}),
      children: [],
    };
  };

  const projectNode = (ref: string): State => {
    const attrs = graph.getNodeAttributes(ref);
    const children: State[] = [];
    const links: { relation: string; target: State }[] = [];

    graph.forEachOutEdge(ref, (_edge, edgeAttrs, _source, target) => {
      if (edgeAttrs.type === "child") {
        children.push(projectNode(target));
      } else {
        links.push({
          relation: edgeAttrs.type,
          target: projectNodeRef(target),
        });
      }
    });

    return {
      ref,
      ...(attrs.id ? { id: attrs.id } : {}),
      ...(attrs.alias && attrs.alias.length > 0 ? { alias: attrs.alias } : {}),
      name: attrs.type,
      description: attrs.description,
      parent: attrs.parent,
      ...(attrs.information ? { information: attrs.information } : {}),
      children,
      ...(links.length > 0 ? { links } : {}),
    };
  };

  const createNode = (
    parentRef: string | null,
    type: Structure,
    information?: string,
    id?: string,
    alias?: readonly string[],
  ): Structure => {
    const ref = nextRef();

    graph.addNode(ref, {
      type: type.name,
      description: type.description,
      parent: type.parent,
      information,
      ...(id ? { id } : {}),
      ...(alias && alias.length > 0 ? { alias } : {}),
    });

    if (parentRef) {
      if (!graph.hasNode(parentRef)) throw new Error(`Parent not found: ${parentRef}`);
      graph.addDirectedEdge(parentRef, ref, { type: "child" });
    }

    return {
      ref,
      ...(id ? { id } : {}),
      ...(alias && alias.length > 0 ? { alias } : {}),
      name: type.name,
      description: type.description,
      parent: type.parent,
      information,
    };
  };

  // ===== Runtime: load before every op, save after every mutation =====

  const runtime: Runtime = {
    create(parent, type, information, id, alias) {
      load();
      const node = createNode(parent?.ref ?? null, type, information, id, alias);
      save();
      return node;
    },

    remove(node) {
      load();
      if (!node.ref || !graph.hasNode(node.ref)) return;
      const subtreeRefs = collectSubtree(node.ref);
      graph.forEachInEdge(node.ref, (edge, attrs) => {
        if (attrs.type === "child") graph.dropEdge(edge);
      });
      for (const r of subtreeRefs.reverse()) {
        graph.dropNode(r);
      }
      save();
    },

    transform(_source, target, information) {
      load();
      const targetParent = target.parent;
      if (!targetParent) {
        throw new Error(`Cannot transform to root structure: ${target.name}`);
      }
      let parentRef: string | undefined;
      graph.forEachNode((ref, attrs) => {
        if (!parentRef && attrs.type === targetParent.name) {
          parentRef = ref;
        }
      });
      if (!parentRef) {
        throw new Error(`No node found for structure: ${targetParent.name}`);
      }
      const node = createNode(parentRef, target, information);
      save();
      return node;
    },

    link(from, to, relation, reverse) {
      load();
      if (!from.ref) throw new Error("Source node has no ref");
      if (!to.ref) throw new Error("Target node has no ref");

      let changed = false;

      // Forward: from → to
      let fwdExists = false;
      graph.forEachOutEdge(from.ref, (_edge, attrs, _source, target) => {
        if (target === to.ref && attrs.type === relation) fwdExists = true;
      });
      if (!fwdExists) {
        graph.addDirectedEdge(from.ref, to.ref, { type: relation });
        changed = true;
      }

      // Reverse: to → from
      let revExists = false;
      graph.forEachOutEdge(to.ref, (_edge, attrs, _source, target) => {
        if (target === from.ref && attrs.type === reverse) revExists = true;
      });
      if (!revExists) {
        graph.addDirectedEdge(to.ref, from.ref, { type: reverse });
        changed = true;
      }

      if (changed) save();
    },

    unlink(from, to, relation, reverse) {
      load();
      if (!from.ref || !to.ref) return;

      let changed = false;

      // Forward
      let fwdEdge: string | undefined;
      graph.forEachOutEdge(from.ref, (edge, attrs, _source, target) => {
        if (target === to.ref && attrs.type === relation) fwdEdge = edge;
      });
      if (fwdEdge) {
        graph.dropEdge(fwdEdge);
        changed = true;
      }

      // Reverse
      let revEdge: string | undefined;
      graph.forEachOutEdge(to.ref, (edge, attrs, _source, target) => {
        if (target === from.ref && attrs.type === reverse) revEdge = edge;
      });
      if (revEdge) {
        graph.dropEdge(revEdge);
        changed = true;
      }

      if (changed) save();
    },

    project(node) {
      load();
      if (!node.ref || !graph.hasNode(node.ref)) {
        throw new Error(`Node not found: ${node.ref}`);
      }
      return projectNode(node.ref);
    },

    roots() {
      load();
      const result: Structure[] = [];
      graph.forEachNode((ref, attrs) => {
        let isRoot = true;
        graph.forEachInEdge(ref, (_edge, edgeAttrs) => {
          if (edgeAttrs.type === "child") isRoot = false;
        });
        if (isRoot) {
          result.push({
            ref,
            ...(attrs.id ? { id: attrs.id } : {}),
            ...(attrs.alias && attrs.alias.length > 0 ? { alias: attrs.alias } : {}),
            name: attrs.type,
            description: attrs.description,
            parent: attrs.parent,
            information: attrs.information,
          });
        }
      });
      return result;
    },
  };

  // ===== ResourceX =====

  let resourcex: ReturnType<typeof createResourceX> | undefined;
  if (config.resourceDir !== null) {
    setProvider(new NodeProvider());
    resourcex = createResourceX({
      path: config.resourceDir ?? join(homedir(), ".deepractice", "resourcex"),
    });
  }

  return { runtime, resourcex };
}
