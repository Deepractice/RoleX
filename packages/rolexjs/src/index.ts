/**
 * rolexjs — RoleX entry point.
 *
 * Usage:
 *   import { createRolex, world, WORLD_TOPICS } from "rolexjs";
 *
 *   const rolex = createRolex({ platform });
 *
 *   // MCP server uses individual system only
 *   await rolex.individual.execute("identity", { roleId: "sean" });
 */

// Entry point
export { createRolex } from "./createRolex.js";
export type { RolexConfig, Rolex } from "./createRolex.js";

// Base role templates
export { base } from "./base/index.js";

// Render
export { wrapOutput, statusBar, readRoleState } from "./render.js";

// Re-export core types
export * from "@rolexjs/core";
