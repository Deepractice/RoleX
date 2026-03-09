/**
 * rolexjs — RoleX unified entry point.
 *
 * Usage:
 *   import { createRoleX, Role } from "rolexjs";
 *
 *   const rolex = await createRoleX(platform);
 *   const role = await rolex.activate("sean");
 *   await role.want("Feature: Ship v1", "ship-v1");
 */

// Re-export core (structures, processes, Role, types)
export * from "@rolexjs/core";
// Product Render
export type { ProductAction } from "./product-render.js";
export { renderProduct, renderProductResult } from "./product-render.js";
// Project Render
export type { ProjectAction } from "./project-render.js";
export { renderProjectResult } from "./project-render.js";
// Render
export { detail } from "./render.js";
// API
export { createRoleX, RoleX } from "./rolex.js";
