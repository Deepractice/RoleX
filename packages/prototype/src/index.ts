/**
 * @rolexjs/prototype — RoleX operation layer.
 *
 * Schema + implementation, platform-agnostic:
 *   - Instruction registry (schema for all operations)
 *   - toArgs dispatch (named → positional argument mapping)
 *   - createCommands (platform-agnostic command implementations)
 *   - Process and world descriptions (from .feature files)
 */

// Apply prototype (internal API — not exposed as MCP instruction)
export type { ApplyResult } from "./apply.js";
export { applyPrototype } from "./apply.js";
// Commands
export type { CommandContext, CommandResult, CommandResultMap, Commands } from "./commands.js";
export { createCommands } from "./commands.js";
// Descriptions (auto-generated from .feature files)
export { processes, world } from "./descriptions/index.js";
// Directives (auto-generated from .feature files)
export { directives } from "./directives/index.js";
// Dispatch
export { toArgs } from "./dispatch.js";
// Instruction registry
export { instructions } from "./instructions.js";
// Schema types
export type { ArgEntry, InstructionDef, ParamDef, ParamType, ToolDef } from "./schema.js";
// Tool definitions
export { tools, worldInstructions } from "./tools.js";
