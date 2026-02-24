/**
 * localPlatform — create a Platform backed by local filesystem.
 *
 * Storage layout:
 *   {dataDir}/
 *     role/<id>/
 *       individual.json          — manifest (tree structure + links)
 *       <id>.<type>.feature      — node information (Gherkin)
 *     organization/<id>/
 *       organization.json        — manifest (tree structure + links)
 *       <id>.<type>.feature      — node information (Gherkin)
 *
 * In-memory: Map-based tree (same model as @rolexjs/system createRuntime).
 * Persistence: loaded before every operation, saved after every mutation.
 * Refs are stored in manifests to ensure stability across reload cycles.
 * When dataDir is null, runs purely in-memory (useful for tests).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { NodeProvider } from "@resourcexjs/node-provider";
import type { Platform } from "@rolexjs/core";
import { organizationType, roleType } from "@rolexjs/resourcex-types";
import type { Prototype, Runtime, State, Structure } from "@rolexjs/system";
import { createResourceX, setProvider } from "resourcexjs";
import { filesToState, type Manifest, stateToFiles } from "./manifest.js";

// ===== Internal types =====

interface TreeNode {
  node: Structure;
  parent: string | null;
  children: string[];
}

interface LinkEntry {
  toId: string;
  relation: string;
}

// ===== Config =====

export interface LocalPlatformConfig {
  /** Directory for persistent storage. Defaults to ~/.deepractice/rolex. Set to null for in-memory only. */
  dataDir?: string | null;
  /** Directory for ResourceX storage. Defaults to ~/.deepractice/resourcex. Set to null to disable. */
  resourceDir?: string | null;
}

/** Create a local Platform. Persistent by default (~/.deepractice/rolex), in-memory if dataDir is null. */
export function localPlatform(config: LocalPlatformConfig = {}): Platform {
  const dataDir =
    config.dataDir === null
      ? undefined
      : (config.dataDir ?? join(homedir(), ".deepractice", "rolex"));

  const nodes = new Map<string, TreeNode>();
  const links = new Map<string, LinkEntry[]>();
  let counter = 0;

  // ===== Internal helpers =====

  const nextRef = () => `n${++counter}`;

  const findByStructure = (s: Structure): TreeNode | undefined => {
    for (const treeNode of nodes.values()) {
      if (treeNode.node.name === s.name) return treeNode;
    }
    return undefined;
  };

  const removeSubtree = (ref: string): void => {
    const treeNode = nodes.get(ref);
    if (!treeNode) return;
    for (const childRef of [...treeNode.children]) {
      removeSubtree(childRef);
    }
    links.delete(ref);
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

  // ===== Persistence =====

  /** Use a stored ref, updating counter to avoid future collisions. */
  const useRef = (storedRef: string): string => {
    const n = parseInt(storedRef.slice(1), 10);
    if (!Number.isNaN(n) && n > counter) counter = n;
    return storedRef;
  };

  /** Replay a State tree into the in-memory Maps. Returns the root ref. */
  const replayState = (state: State, parentRef: string | null): string => {
    const ref = state.ref ? useRef(state.ref) : nextRef();
    const node: Structure = {
      ref,
      ...(state.id ? { id: state.id } : {}),
      ...(state.alias ? { alias: state.alias } : {}),
      name: state.name,
      description: state.description ?? "",
      parent: null,
      ...(state.information ? { information: state.information } : {}),
    };
    const treeNode: TreeNode = { node, parent: parentRef, children: [] };
    nodes.set(ref, treeNode);

    if (parentRef) {
      nodes.get(parentRef)!.children.push(ref);
    }

    if (state.children) {
      for (const child of state.children) {
        replayState(child, ref);
      }
    }

    return ref;
  };

  const loadEntitiesFrom = (
    dir: string,
    manifestName: string,
    parentRef: string
  ): { ref: string; manifest: Manifest }[] => {
    const results: { ref: string; manifest: Manifest }[] = [];
    if (!existsSync(dir)) return results;

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const entityDir = join(dir, entry.name);
      const manifestPath = join(entityDir, manifestName);
      if (!existsSync(manifestPath)) continue;

      const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      const featureFiles: Record<string, string> = {};
      for (const file of readdirSync(entityDir)) {
        if (file.endsWith(".feature")) {
          featureFiles[file] = readFileSync(join(entityDir, file), "utf-8");
        }
      }
      const state = filesToState(manifest, featureFiles);
      const entityRef = replayState(state, parentRef);
      results.push({ ref: entityRef, manifest });
    }

    return results;
  };

  const load = () => {
    if (!dataDir) return;

    // Clear and rebuild from disk
    nodes.clear();
    links.clear();
    counter = 0;

    // Create implicit society root
    const societyRef = nextRef();
    nodes.set(societyRef, {
      node: {
        ref: societyRef,
        name: "society",
        description: "",
        parent: null,
      },
      parent: null,
      children: [],
    });

    // Load entities
    const entityRefs = [
      ...loadEntitiesFrom(join(dataDir, "role"), "individual.json", societyRef),
      ...loadEntitiesFrom(join(dataDir, "organization"), "organization.json", societyRef),
    ];

    // Build id → ref index for link resolution
    const idToRef = new Map<string, string>();
    for (const [ref, treeNode] of nodes) {
      if (treeNode.node.id) {
        idToRef.set(treeNode.node.id, ref);
      }
    }

    // Resolve links from manifests (all nodes, not just root)
    const collectLinks = (
      nodeId: string,
      node: {
        links?: Record<string, string[]>;
        children?: Record<string, import("./manifest.js").ManifestNode>;
      }
    ) => {
      if (node.links) {
        const sourceRef = idToRef.get(nodeId);
        if (sourceRef) {
          const entries: LinkEntry[] = links.get(sourceRef) ?? [];
          for (const [relation, targetIds] of Object.entries(node.links)) {
            for (const targetId of targetIds) {
              const targetRef = idToRef.get(targetId);
              if (
                targetRef &&
                !entries.some((l) => l.toId === targetRef && l.relation === relation)
              ) {
                entries.push({ toId: targetRef, relation });
              }
            }
          }
          if (entries.length > 0) links.set(sourceRef, entries);
        }
      }
      if (node.children) {
        for (const [childId, childNode] of Object.entries(node.children)) {
          collectLinks(childId, childNode);
        }
      }
    };

    for (const { manifest } of entityRefs) {
      collectLinks(manifest.id, manifest);
    }
  };

  const saveEntity = (baseDir: string, entityId: string, manifestName: string, state: State) => {
    const entityDir = join(baseDir, entityId);
    mkdirSync(entityDir, { recursive: true });
    const { manifest, files } = stateToFiles(state);
    writeFileSync(join(entityDir, manifestName), JSON.stringify(manifest, null, 2), "utf-8");
    for (const file of files) {
      writeFileSync(join(entityDir, file.path), file.content, "utf-8");
    }
  };

  const save = () => {
    if (!dataDir) return;
    mkdirSync(dataDir, { recursive: true });

    // Find society root
    let societyTreeNode: TreeNode | undefined;
    for (const treeNode of nodes.values()) {
      if (treeNode.parent === null && treeNode.node.name === "society") {
        societyTreeNode = treeNode;
        break;
      }
    }
    if (!societyTreeNode) return;

    // Clean up existing entity directories
    const roleDir = join(dataDir, "role");
    const orgDir = join(dataDir, "organization");
    if (existsSync(roleDir)) rmSync(roleDir, { recursive: true });
    if (existsSync(orgDir)) rmSync(orgDir, { recursive: true });

    // Save each entity child of society
    for (const childRef of societyTreeNode.children) {
      if (!nodes.has(childRef)) continue;
      const state = projectNode(childRef);
      const entityId = state.id ?? state.name;

      if (state.name === "individual") {
        saveEntity(roleDir, entityId, "individual.json", state);
      } else if (state.name === "organization") {
        saveEntity(orgDir, entityId, "organization.json", state);
      }
      // Other types (past, etc.) are not persisted yet
    }
  };

  // ===== Runtime =====

  const runtime: Runtime = {
    create(parent, type, information, id, alias) {
      load();
      const node = createNode(parent?.ref ?? null, type, information, id, alias);
      save();
      return node;
    },

    remove(node) {
      load();
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
      save();
    },

    transform(_source, target, information) {
      load();
      const targetParent = target.parent;
      if (!targetParent) {
        throw new Error(`Cannot transform to root structure: ${target.name}`);
      }

      const parentTreeNode = findByStructure(targetParent);
      if (!parentTreeNode) {
        throw new Error(`No node found for structure: ${targetParent.name}`);
      }

      const node = createNode(parentTreeNode.node.ref!, target, information);
      save();
      return node;
    },

    link(from, to, relationName, reverseName) {
      load();
      if (!from.ref) throw new Error("Source node has no ref");
      if (!to.ref) throw new Error("Target node has no ref");

      const fromLinks = links.get(from.ref) ?? [];
      if (!fromLinks.some((l) => l.toId === to.ref && l.relation === relationName)) {
        fromLinks.push({ toId: to.ref, relation: relationName });
        links.set(from.ref, fromLinks);
      }

      const toLinks = links.get(to.ref) ?? [];
      if (!toLinks.some((l) => l.toId === from.ref && l.relation === reverseName)) {
        toLinks.push({ toId: from.ref, relation: reverseName });
        links.set(to.ref, toLinks);
      }

      save();
    },

    unlink(from, to, relationName, reverseName) {
      load();
      if (!from.ref || !to.ref) return;

      const fromLinks = links.get(from.ref);
      if (fromLinks) {
        const filtered = fromLinks.filter(
          (l) => !(l.toId === to.ref && l.relation === relationName)
        );
        if (filtered.length === 0) links.delete(from.ref);
        else links.set(from.ref, filtered);
      }

      const toLinks = links.get(to.ref);
      if (toLinks) {
        const filtered = toLinks.filter(
          (l) => !(l.toId === from.ref && l.relation === reverseName)
        );
        if (filtered.length === 0) links.delete(to.ref);
        else links.set(to.ref, filtered);
      }

      save();
    },

    project(node) {
      load();
      if (!node.ref || !nodes.has(node.ref)) {
        throw new Error(`Node not found: ${node.ref}`);
      }
      return projectNode(node.ref);
    },

    roots() {
      load();
      const result: Structure[] = [];
      for (const treeNode of nodes.values()) {
        if (treeNode.parent === null) {
          result.push(treeNode.node);
        }
      }
      return result;
    },
  };

  // ===== ResourceX =====

  let resourcex: ReturnType<typeof createResourceX> | undefined;
  if (config.resourceDir !== null) {
    setProvider(new NodeProvider());
    resourcex = createResourceX({
      path: config.resourceDir ?? join(homedir(), ".deepractice", "resourcex"),
      types: [roleType, organizationType],
    });
  }

  // ===== Prototype registry =====

  const registryPath = dataDir ? join(dataDir, "prototype.json") : undefined;

  const readRegistry = (): Record<string, string> => {
    if (!registryPath || !existsSync(registryPath)) return {};
    return JSON.parse(readFileSync(registryPath, "utf-8"));
  };

  const registerPrototype = (id: string, source: string): void => {
    if (!registryPath) return;
    const registry = readRegistry();
    registry[id] = source;
    mkdirSync(dataDir!, { recursive: true });
    writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf-8");
  };

  const prototype: Prototype = {
    async resolve(id) {
      if (!resourcex) return undefined;
      const registry = readRegistry();
      const source = registry[id];
      if (!source) return undefined;
      try {
        return await resourcex.ingest<State>(source);
      } catch {
        return undefined;
      }
    },
  };

  return { runtime, prototype, resourcex, registerPrototype };
}
