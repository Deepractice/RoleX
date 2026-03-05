/**
 * Renderer — interface for rendering command results as Markdown.
 *
 * Each business renderer implements this interface to transform
 * a CommandResult into AI-readable Markdown text.
 */

import type { CommandResult } from "@rolexjs/prototype";

/** Renders a command result into AI-readable Markdown. */
export interface Renderer {
  render(command: string, result: CommandResult): string;
}
