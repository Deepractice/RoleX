/**
 * @rolexjs/prototype — Prototype system for RoleX.
 *
 * A prototype is a command-driven instruction list (like a Dockerfile).
 * Each instruction maps to a rolex.use() call.
 *
 * Three exports:
 *   PrototypeInstruction — the instruction format
 *   Prototype            — registry interface (settle/list)
 *   prototypeType        — ResourceX type handler
 */

export type { PrototypeInstruction } from "./instruction.js";
export type { Prototype, PrototypeResolver } from "./prototype.js";
export { prototypeType } from "./resourcex.js";
