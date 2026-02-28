/**
 * rolexjs — RoleX API + Render layer.
 *
 * Usage:
 *   import { Rolex, Role, describe, hint } from "rolexjs";
 *
 *   const rolex = createRoleX(platform);
 *   await rolex.genesis();
 *   const role = await rolex.activate("sean");
 *   role.want("Feature: Ship v1", "ship-v1");
 */

// Re-export core (structures + processes)
export * from "@rolexjs/core";
// Context
export { RoleContext } from "./context.js";
// Feature (Gherkin type + parse/serialize)
export type { DataTableRow, Feature, Scenario, Step } from "./feature.js";
export { parse, serialize } from "./feature.js";
export type { RenderStateOptions } from "./render.js";
// Render
export { describe, detail, directive, hint, renderState, world } from "./render.js";
export type { RolexResult } from "./role.js";
// Role
export { Role } from "./role.js";
// API
export type { CensusEntry } from "./rolex.js";
export { createRoleX, Rolex } from "./rolex.js";
