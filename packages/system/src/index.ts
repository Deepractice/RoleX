/**
 * @rolexjs/system — Structure · Process · State
 *
 * Pure systems theory primitives (domain-agnostic).
 *
 * Three concepts:
 *   Structure   — the universal node (type and instance are one)
 *   Process     — how it changes (create, remove, transform)
 *   State       — what you see (projection after process)
 *
 * Universal formula:
 *   State = Process(Structure, Information?)
 */

// ===== Structure =====

export type { Structure } from "./structure.js";
export { structure } from "./structure.js";

// ===== Process + State =====

export type { Create, Remove, Transform, TreeOp, Process, State } from "./process.js";
export { create, remove, transform, process } from "./process.js";

// ===== Runtime =====

export type { Runtime } from "./runtime.js";
export { createRuntime } from "./runtime.js";
