/**
 * rolexjs — RoleX API + Render layer.
 *
 * Usage:
 *   import { Rolex, Role, describe, hint } from "rolexjs";
 *
 *   const rolex = await createRoleX(platform);
 *   await rolex.genesis();
 *   const role = await rolex.activate("sean");
 *   await role.want("Feature: Ship v1", "ship-v1");
 */

// Re-export core (structures + processes)
export * from "@rolexjs/core";
// Re-export genesis
export { genesis } from "@rolexjs/genesis";
// Context
export { RoleContext } from "./context.js";
// Feature (Gherkin type + parse/serialize)
export type { DataTableRow, Feature, Scenario, Step } from "./feature.js";
export { parse, serialize } from "./feature.js";
// Find
export { findInState } from "./find.js";
// Issue Render
export type { IssueAction, LabelResolver } from "./issue-render.js";
export {
  renderComment,
  renderCommentList,
  renderIssue,
  renderIssueList,
  renderIssueResult,
} from "./issue-render.js";
// Project Render
export type { ProjectAction } from "./project-render.js";
export { renderProject, renderProjectResult } from "./project-render.js";
export type { RenderOptions, RenderStateOptions } from "./render.js";
// Render
export { describe, detail, directive, hint, render, renderState, world } from "./render.js";
// Renderer
export type { Renderer, TextRendererOptions } from "./renderer.js";
export { JsonRenderer, TextRenderer } from "./renderer.js";
// Role
export { Role } from "./role.js";
// API
export type { CensusEntry } from "./rolex.js";
export { createRoleX, Rolex } from "./rolex.js";
