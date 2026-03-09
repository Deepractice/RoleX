/**
 * ProductRenderer — Markdown rendering for product.* commands.
 *
 * Covers: create, strategy, spec, release, channel, own, disown, deprecate.
 * Uses specialized product layout (owner, strategy, specs, releases, channels).
 */

import type { CommandResult } from "@rolexjs/core";
import { type ProductAction, renderProductResult } from "../product-render.js";
import type { Renderer } from "./renderer.js";

export class ProductRenderer implements Renderer {
  render(command: string, result: CommandResult): string {
    const action = (
      command.startsWith("product.") ? command.slice("product.".length) : command
    ) as ProductAction;
    return renderProductResult(action, result.state);
  }
}
