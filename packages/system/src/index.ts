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

export type { Structure, Relation } from "./structure.js";
export { structure, relation } from "./structure.js";

// ===== Process + State =====

export type {
  Create,
  Remove,
  Transform,
  Link,
  Unlink,
  GraphOp,
  Process,
  State,
} from "./process.js";
export { create, remove, transform, link, unlink, process } from "./process.js";

// ===== Runtime =====

export type { Runtime } from "./runtime.js";
export { createRuntime } from "./runtime.js";
