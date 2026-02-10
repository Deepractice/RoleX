/**
 * api/index.ts — Public API surface.
 */

export type { ApiOperation, ApiContext, ApiNamespace, ApiRegistry, Permission } from "./types.js";
export type { NamespaceTool } from "./namespace-tool.js";
export { buildNamespaceTool } from "./namespace-tool.js";
export { apiRegistry } from "./registry.js";
export { societyOperations } from "./society.js";
export { organizationOperations } from "./organization.js";
export { roleOperations } from "./role.js";
export { skillOperations } from "./skill.js";
