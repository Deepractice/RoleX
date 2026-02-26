/**
 * @rolexjs/prototype — RoleX operation layer.
 *
 * Schema + implementation, platform-agnostic:
 *   - Instruction registry (schema for all operations)
 *   - toArgs dispatch (named → positional argument mapping)
 *   - createOps (platform-agnostic operation implementations)
 *   - Process and world descriptions (from .feature files)
 */

// Schema types
export type { ArgEntry, InstructionDef, ParamDef, ParamType } from "./schema.js";

// Instruction registry
export { instructions } from "./instructions.js";

// Dispatch
export { toArgs } from "./dispatch.js";

// Operations
export type { OpResult, Ops, OpsContext } from "./ops.js";
export { createOps } from "./ops.js";

// Descriptions (auto-generated from .feature files)
export { processes, world } from "./descriptions/index.js";
