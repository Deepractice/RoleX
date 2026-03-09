/**
 * RoleRenderer — Markdown rendering for role.* commands.
 *
 * Covers: focus, want, plan, todo, finish, complete, abandon,
 * reflect, realize, master, forget, skill.
 */

import type { CommandResult } from "@rolexjs/core";
import { collectPermissions, describe, hint, renderPermissions, renderState } from "../render.js";
import type { Renderer } from "./renderer.js";

export class RoleRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const process = command.startsWith("role.") ? command.slice("role.".length) : command;
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    lines.push(describe(process, name, result.state));
    lines.push(hint(process));
    lines.push("");
    lines.push(renderState(result.state));

    // Activate: append permissions collected from links
    if (process === "activate") {
      const permissions = collectPermissions(result.state);
      if (permissions.length > 0) {
        lines.push("");
        lines.push(renderPermissions(permissions));
      }
    }

    return lines.join("\n");
  }
}
