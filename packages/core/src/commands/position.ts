/**
 * Commands — position.* commands.
 */

import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

export function positionCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, society, resolve } = ctx;
  const { ok, archive, validateGherkin, removeExisting } = helpers;

  return {
    async "position.establish"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.position, content, id, alias);
      return ok(node, "establish");
    },

    async "position.charge"(position: string, duty: string, id?: string): Promise<CommandResult> {
      validateGherkin(duty);
      const node = await rt.create(await resolve(position), C.duty, duty, id);
      return ok(node, "charge");
    },

    async "position.require"(
      position: string,
      procedure: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(position);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.requirement, procedure, id);
      return ok(node, "require");
    },

    async "position.abolish"(position: string): Promise<CommandResult> {
      return archive(await resolve(position), "abolish");
    },

    async "position.appoint"(position: string, individual: string): Promise<CommandResult> {
      const posNode = await resolve(position);
      const indNode = await resolve(individual);
      await rt.link(posNode, indNode, "appointment", "serve");
      return ok(posNode, "appoint");
    },

    async "position.dismiss"(position: string, individual: string): Promise<CommandResult> {
      const posNode = await resolve(position);
      await rt.unlink(posNode, await resolve(individual), "appointment", "serve");
      return ok(posNode, "dismiss");
    },
  };
}
