/**
 * rolexjs — RoleX entry point.
 *
 * Usage:
 *   import { createRolex, world, descriptions } from "rolexjs";
 *
 *   const rolex = createRolex({ platform, resourcex });
 *
 *   // MCP server uses individual system only
 *   await rolex.individual.execute("identity", { roleId: "sean" });
 */

// Entry point
export { createRolex } from "./createRolex.js";
export type { RolexConfig, Rolex } from "./createRolex.js";

// Descriptions
export {
  world, WORLD_TOPICS,
  systems, individual, role, org, governance,
  descriptions, PROCESS_NAMES,
} from "./descriptions.js";
export type { WorldTopic, ProcessName } from "./descriptions.js";

// Render
export { wrapOutput, statusBar, readRoleState } from "./render.js";

// Re-export core types
export * from "@rolexjs/core";
