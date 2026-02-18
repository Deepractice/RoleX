/**
 * @rolexjs/system — Structure · Relation · Process · State
 *
 * Pure systems theory primitives (domain-agnostic).
 *
 * Four concepts:
 *   Structure   — the universal node (concept, container, and information carrier)
 *   Relation    — cross-branch link between structures
 *   Process     — how it changes (create, remove, transform, link, unlink)
 *   State       — what you see (projection after process)
 *
 * Tree (parent-child) provides the hierarchical backbone.
 * Relations provide cross-branch associations.
 * Together they form a graph.
 *
 * Universal formula:
 *   State = Process(Structure, Information?)
 */

// ===== Structure + Relation =====

export type { Relation, Structure } from "./structure.js";
export { relation, structure } from "./structure.js";

// ===== Process + State =====

export type {
  Create,
  GraphOp,
  Link,
  Process,
  Remove,
  State,
  Transform,
  Unlink,
} from "./process.js";
export { create, link, process, remove, transform, unlink } from "./process.js";

// ===== Merge =====

export { mergeState } from "./merge.js";

// ===== Prototype =====

export type { Prototype } from "./prototype.js";
export { createPrototype } from "./prototype.js";

// ===== Runtime =====

export type { Runtime } from "./runtime.js";
export { createRuntime } from "./runtime.js";
