/**
 * CensusRenderer — Markdown rendering for census.* commands.
 *
 * Covers: list.
 * Note: census.list currently returns string (not CommandResult).
 * This renderer is a placeholder for when census.list is refactored
 * to return structured data.
 */

import type { CommandResult } from "@rolexjs/prototype";
import { describe, hint, renderState } from "../render.js";
import type { Renderer } from "./renderer.js";

export class CensusRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const process = command.startsWith("census.") ? command.slice("census.".length) : command;
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    lines.push(describe(process, name, result.state));
    lines.push(hint(process));
    lines.push("");
    lines.push(renderState(result.state));

    return lines.join("\n");
  }
}
