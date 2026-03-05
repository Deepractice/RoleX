/**
 * ProjectRenderer — Markdown rendering for project.* commands.
 *
 * Covers: launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive.
 * Uses specialized project layout (members, milestones, deliverables, wiki sections).
 */

import type { CommandResult } from "@rolexjs/core";
import { type ProjectAction, renderProjectResult } from "../project-render.js";
import type { Renderer } from "./renderer.js";

export class ProjectRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const action = (
      command.startsWith("project.") ? command.slice("project.".length) : command
    ) as ProjectAction;
    return renderProjectResult(action, result.state);
  }
}
