/**
 * rolexjs — RoleX unified entry point.
 *
 * Usage:
 *   import { createRoleX } from "rolexjs";
 *
 *   const rx = createRoleX({ platform });
 *   const role = await rx.role.activate({ individual: "sean" });
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
// API
export type { RoleXConfig } from "./rolex.js";
export { createRoleX } from "./rolex.js";
