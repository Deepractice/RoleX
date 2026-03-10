/**
 * Commands — product.* commands.
 */

import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

export function productCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, resolve } = ctx;
  const { ok, archive, validateGherkin } = helpers;

  return {
    async "product.strategy"(
      product: string,
      strategy: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(strategy);
      const node = await rt.create(await resolve(product), C.strategy, strategy, id);
      return ok(node, "strategy");
    },

    async "product.spec"(product: string, spec: string, id?: string): Promise<CommandResult> {
      validateGherkin(spec);
      const node = await rt.create(await resolve(product), C.spec, spec, id);
      return ok(node, "spec");
    },

    async "product.release"(product: string, release: string, id?: string): Promise<CommandResult> {
      validateGherkin(release);
      const node = await rt.create(await resolve(product), C.release, release, id);
      return ok(node, "release");
    },

    async "product.channel"(product: string, channel: string, id?: string): Promise<CommandResult> {
      validateGherkin(channel);
      const node = await rt.create(await resolve(product), C.channel, channel, id);
      return ok(node, "channel");
    },

    async "product.own"(product: string, individual: string): Promise<CommandResult> {
      const prodNode = await resolve(product);
      await rt.link(prodNode, await resolve(individual), "ownership", "own");
      return ok(prodNode, "own");
    },

    async "product.disown"(product: string, individual: string): Promise<CommandResult> {
      const prodNode = await resolve(product);
      await rt.unlink(prodNode, await resolve(individual), "ownership", "own");
      return ok(prodNode, "disown");
    },

    async "product.deprecate"(product: string): Promise<CommandResult> {
      return archive(await resolve(product), "deprecate");
    },
  };
}
