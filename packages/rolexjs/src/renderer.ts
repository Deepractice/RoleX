/**
 * Renderer — pluggable rendering for command results.
 *
 * The Renderer interface defines a single entry point: render(command, result).
 * Implementations decide how to transform a CommandResult into their output type.
 *
 * Built-in implementations:
 *   - TextRenderer: 3-layer markdown text (status + hint + state tree) for AI/MCP
 *   - JsonRenderer: passthrough structured State for UI consumers
 */

import type { CommandResult } from "@rolexjs/prototype";
import type { State } from "@rolexjs/system";
import { renderProjectResult } from "./project-render.js";
import { describe, hint, type RenderStateOptions, renderState } from "./render.js";

// ================================================================
//  Interface
// ================================================================

/** Pluggable renderer — transforms a command result into output type T. */
export interface Renderer<T> {
  render(command: string, result: CommandResult): T;
}

// ================================================================
//  TextRenderer — 3-layer markdown output
// ================================================================

export interface TextRendererOptions {
  /** Provide an AI cognitive hint for a given command. */
  cognitiveHint?: (command: string) => string | null;
  /** Fold predicate — folded nodes render heading only. */
  fold?: RenderStateOptions["fold"];
}

/**
 * TextRenderer — renders CommandResult as 3-layer markdown text.
 *
 * Layer 1: Status — what just happened (describe)
 * Layer 2: Hint — what to do next (hint + cognitive hint)
 * Layer 3: Projection — full state tree as markdown (renderState)
 *
 * project.* commands use a specialized project layout.
 */
export class TextRenderer implements Renderer<string> {
  private options: TextRendererOptions;

  constructor(options?: TextRendererOptions) {
    this.options = options ?? {};
  }

  render(command: string, result: CommandResult): string {
    // project.* → specialized project rendering
    if (command.startsWith("project.")) {
      return renderProjectResult(command.slice("project.".length) as any, result.state);
    }

    // Default: 3-layer output
    const name = result.state.id ?? result.state.name;
    const lines: string[] = [];

    // Layer 1: Status
    lines.push(describe(result.process, name, result.state));

    // Layer 2: Hint
    lines.push(hint(result.process));
    const cogHint = this.options.cognitiveHint?.(command);
    if (cogHint) {
      lines.push(`I → ${cogHint}`);
    }

    // Layer 3: Projection
    lines.push("");
    lines.push(
      renderState(result.state, 1, this.options.fold ? { fold: this.options.fold } : undefined)
    );

    return lines.join("\n");
  }
}

// ================================================================
//  JsonRenderer — passthrough structured data
// ================================================================

/** JsonRenderer — returns the State tree directly for UI consumers. */
export class JsonRenderer implements Renderer<State> {
  render(_command: string, result: CommandResult): State {
    return result.state;
  }
}
