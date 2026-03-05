/**
 * Renderers — business-domain Markdown renderers for AI readability.
 *
 * Each renderer handles a command namespace and transforms
 * CommandResult into AI-readable Markdown.
 *
 * createRendererRouter() wires all renderers into a RendererRouter.
 */

import { RendererRouter } from "@rolexjs/prototype";
import { CensusRenderer } from "./census.js";
import { IndividualRenderer } from "./individual.js";
import { OrgRenderer } from "./org.js";
import { PositionRenderer } from "./position.js";
import { ProjectRenderer } from "./project.js";
import { RoleRenderer } from "./role.js";

export { CensusRenderer } from "./census.js";
export { IndividualRenderer } from "./individual.js";
export { OrgRenderer } from "./org.js";
export { PositionRenderer } from "./position.js";
export { ProjectRenderer } from "./project.js";
export type { Renderer } from "./renderer.js";
export { RoleRenderer } from "./role.js";

/** Create a RendererRouter with all business renderers registered. */
export function createRendererRouter(): RendererRouter {
  return new RendererRouter()
    .register("role", new RoleRenderer())
    .register("individual", new IndividualRenderer())
    .register("org", new OrgRenderer())
    .register("position", new PositionRenderer())
    .register("project", new ProjectRenderer())
    .register("census", new CensusRenderer());
}
