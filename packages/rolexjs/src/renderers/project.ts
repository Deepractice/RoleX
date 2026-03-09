/**
 * ProjectRenderer — Markdown rendering for project.* commands.
 *
 * Covers: launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive, produce.
 * Uses specialized project layout (members, milestones, deliverables, wiki sections).
 * "produce" delegates to ProductRenderer since it returns product state.
 */

import type { CommandResult } from "@rolexjs/core";
import { type ProductAction, renderProductResult } from "../product-render.js";
import { type ProjectAction, renderProjectResult } from "../project-render.js";
import type { Renderer } from "./renderer.js";

export class ProjectRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const action = (
      command.startsWith("project.") ? command.slice("project.".length) : command
    ) as ProjectAction;
    // produce returns product state, delegate to product renderer
    if (action === "produce") {
      return renderProductResult(action as unknown as ProductAction, result.state);
    }
    return renderProjectResult(action, result.state);
  }
}
