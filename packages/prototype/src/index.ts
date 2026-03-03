/**
 * @rolexjs/prototype — RoleX operation layer.
 *
 * Schema + implementation, platform-agnostic:
 *   - Instruction registry (schema for all operations)
 *   - toArgs dispatch (named → positional argument mapping)
 *   - createOps (platform-agnostic operation implementations)
 *   - Process and world descriptions (from .feature files)
 */

// Descriptions (auto-generated from .feature files)
export { processes, world } from "./descriptions/index.js";
// Directives (auto-generated from .feature files)
export { directives } from "./directives/index.js";
// Dispatch
export { toArgs } from "./dispatch.js";
// Instruction registry
export { instructions } from "./instructions.js";

// Operations
export type { OpResult, Ops, OpsContext } from "./ops.js";
export { createOps } from "./ops.js";
// Schema types
export type { ArgEntry, InstructionDef, ParamDef, ParamType } from "./schema.js";
