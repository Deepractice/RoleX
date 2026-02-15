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

// API
export { Rolex } from "./rolex.js";
export type { RolexResult, RolexConfig } from "./rolex.js";

// Render
export { describe, hint, detail } from "./render.js";

// Feature (Gherkin type + parse/serialize)
export type { Feature, Scenario, Step, DataTableRow } from "./feature.js";
export { parse, serialize } from "./feature.js";

// Re-export core (structures + processes)
export * from "@rolexjs/core";
