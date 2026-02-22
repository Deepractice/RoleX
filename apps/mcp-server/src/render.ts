/**
 * Render — 3-layer output for MCP tool results.
 *
 * Layer 1: Status     — what just happened (describe)
 * Layer 2: Hint       — what to do next (hint)
 * Layer 3: Projection — full state tree as markdown (renderState)
 *
 * MCP and CLI share describe() + hint() + renderState() from rolexjs.
 * Relations are rendered per-node via bidirectional links — no separate layer needed.
 */
import type { RolexResult } from "rolexjs";
import { describe, hint, renderState } from "rolexjs";

// ================================================================
//  Public API
// ================================================================

export interface RenderOptions {
  /** The process that was executed. */
  process: string;
  /** Display name for the primary node. */
  name: string;
  /** Result from the Rolex API. */
  result: RolexResult;
  /** AI cognitive hint — first-person, state-aware self-direction cue. */
  cognitiveHint?: string | null;
}

/** Render a full 3-layer output string. */
export function render(opts: RenderOptions): string {
  const { process, name, result, cognitiveHint } = opts;
  const lines: string[] = [];

  // Layer 1: Status
  lines.push(describe(process, name, result.state));

  // Layer 2: Hint (static) + Cognitive hint (state-aware)
  lines.push(hint(process));
  if (cognitiveHint) {
    lines.push(`I → ${cognitiveHint}`);
  }

  // Layer 3: Projection — generic markdown rendering of the full state tree
  lines.push("");
  lines.push(renderState(result.state));

  return lines.join("\n");
}
