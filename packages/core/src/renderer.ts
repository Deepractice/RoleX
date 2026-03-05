/**
 * Renderer — framework for rendering command results.
 *
 * Renderer interface and RendererRouter live here in prototype
 * because this layer owns all command types and structures.
 * Concrete renderers are registered by the upper layer (rolexjs).
 */

import type { CommandResult } from "./commands.js";

/** Renders a command result into a string (typically Markdown). */
export interface Renderer {
  render(command: string, result: CommandResult): string;
}

/**
 * RendererRouter — routes commands to namespace-specific renderers.
 *
 * Registered renderers handle their namespace (e.g. "role" handles "role.want").
 * Unregistered commands fall through to the default renderer (JSON serialization).
 */
export class RendererRouter implements Renderer {
  private readonly renderers = new Map<string, Renderer>();

  /** Register a renderer for a command namespace. */
  register(namespace: string, renderer: Renderer): this {
    this.renderers.set(namespace, renderer);
    return this;
  }

  /** Route a command to the appropriate renderer. */
  render(command: string, result: CommandResult): string {
    const dot = command.indexOf(".");
    const namespace = dot >= 0 ? command.slice(0, dot) : command;
    const renderer = this.renderers.get(namespace);
    if (renderer) return renderer.render(command, result);
    return defaultRender(command, result);
  }
}

/** Default rendering — structured JSON output for unregistered commands. */
function defaultRender(_command: string, result: CommandResult): string {
  return JSON.stringify(result, null, 2);
}
