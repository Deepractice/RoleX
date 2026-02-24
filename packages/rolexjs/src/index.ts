/**
 * rolexjs — RoleX API + Render layer.
 *
 * Rolex class is stateless — takes node references, returns results.
 * Render functions are standalone — caller composes name + state.
 *
 * Usage:
 *   import { Rolex, describe, hint } from "rolexjs";
 *   import { createGraphRuntime } from "@rolexjs/local-platform";
 *
 *   const rolex = new Rolex({ runtime: createGraphRuntime() });
 *   const result = rolex.born("Feature: I am Sean");
 *   console.log(describe("born", "sean", result.state));
 *   console.log(hint("born"));
 */

// Re-export core (structures + processes)
export * from "@rolexjs/core";
// Context
export { RoleContext } from "./context.js";
// Feature (Gherkin type + parse/serialize)
export type { DataTableRow, Feature, Scenario, Step } from "./feature.js";
export { parse, serialize } from "./feature.js";
// Render
export { describe, detail, hint, renderState, world } from "./render.js";
export type { RolexResult } from "./rolex.js";
// API
export { createRoleX, Rolex } from "./rolex.js";
