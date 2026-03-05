/**
 * Renderers — business-domain Markdown renderers for AI readability.
 *
 * Each renderer handles a command namespace and transforms
 * CommandResult into AI-readable Markdown.
 */

export { CensusRenderer } from "./census.js";
export { IndividualRenderer } from "./individual.js";
export { OrgRenderer } from "./org.js";
export { PositionRenderer } from "./position.js";
export { ProjectRenderer } from "./project.js";
export type { Renderer } from "./renderer.js";
export { RoleRenderer } from "./role.js";
