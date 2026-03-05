/**
 * PositionRenderer — Markdown rendering for position.* commands.
 *
 * Covers: establish, charge, require, abolish, appoint, dismiss.
 */

import type { CommandResult } from "@rolexjs/core";
import { describe, hint, renderState } from "../render.js";
import type { Renderer } from "./renderer.js";

export class PositionRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const process = command.startsWith("position.") ? command.slice("position.".length) : command;
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    lines.push(describe(process, name, result.state));
    lines.push(hint(process));
    lines.push("");
    lines.push(renderState(result.state));

    return lines.join("\n");
  }
}
