/**
 * IndividualRenderer — Markdown rendering for individual.* commands.
 *
 * @deprecated All individual.* commands have moved to society.* namespace.
 * Kept for backward compatibility. Use SocietyRenderer instead.
 *
 * Previously covered: born, retire, die, rehire, teach, train.
 */

import type { CommandResult } from "@rolexjs/core";
import { describe, hint, renderState } from "../render.js";
import type { Renderer } from "./renderer.js";

export class IndividualRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const process = command.startsWith("individual.")
      ? command.slice("individual.".length)
      : command;
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    lines.push(describe(process, name, result.state));
    lines.push(hint(process));
    lines.push("");
    lines.push(renderState(result.state));

    return lines.join("\n");
  }
}
