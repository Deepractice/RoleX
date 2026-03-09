/**
 * InspectRenderer — Markdown rendering for the inspect top-level operation.
 *
 * Renders any node's full subtree using the generic renderState renderer.
 */

import type { CommandResult } from "@rolexjs/core";
import { describe, hint, renderState } from "../render.js";
import type { Renderer } from "./renderer.js";

export class InspectRenderer implements Renderer {
  render(_command: string, result: CommandResult): string {
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    lines.push(describe(result.process, name, result.state));
    lines.push(hint(result.process));
    lines.push("");
    lines.push(renderState(result.state, 1, { compactLinks: true }));

    return lines.join("\n");
  }
}
