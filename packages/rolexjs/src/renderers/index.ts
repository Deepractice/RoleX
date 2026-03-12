/**
 * Renderers — business-domain Markdown renderers for AI readability.
 *
 * Each renderer handles a command namespace and transforms
 * CommandResult into AI-readable Markdown.
 *
 * createRendererRouter() wires all renderers into a RendererRouter.
 */

import { RendererRouter } from "@rolexjs/core";

/** @deprecated Use SocietyRenderer — individual.* commands moved to society.* */
export { IndividualRenderer } from "./individual.js";

import { InspectRenderer } from "./inspect.js";
import { OrgRenderer } from "./org.js";
import { PositionRenderer } from "./position.js";
import { ProductRenderer } from "./product.js";
import { ProjectRenderer } from "./project.js";
import { RoleRenderer } from "./role.js";
import { SocietyRenderer } from "./society.js";
import { SurveyRenderer } from "./survey.js";

export { InspectRenderer } from "./inspect.js";
export { OrgRenderer } from "./org.js";
export { PositionRenderer } from "./position.js";
export { ProductRenderer } from "./product.js";
export { ProjectRenderer } from "./project.js";
export type { Renderer } from "./renderer.js";
export { RoleRenderer } from "./role.js";
export { SocietyRenderer } from "./society.js";
export { SurveyRenderer } from "./survey.js";

/** Create a RendererRouter with all business renderers registered. */
export function createRendererRouter(): RendererRouter {
  return new RendererRouter()
    .register("role", new RoleRenderer())
    .register("org", new OrgRenderer())
    .register("position", new PositionRenderer())
    .register("product", new ProductRenderer())
    .register("project", new ProjectRenderer())
    .register("society", new SocietyRenderer())
    .register("survey", new SurveyRenderer())
    .register("inspect", new InspectRenderer());
}
