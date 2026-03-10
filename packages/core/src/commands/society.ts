/**
 * Commands — society.* and org.* commands.
 */

import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

export function societyCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, society, resolve } = ctx;
  const { ok, archive, validateGherkin, removeExisting } = helpers;

  return {
    // ---- Society: individual lifecycle ----

    async "society.born"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.individual, content, id, alias);
      await rt.create(node, C.identity, undefined, `${id}-identity`);
      return ok(node, "born");
    },

    async "society.retire"(individual: string): Promise<CommandResult> {
      return archive(await resolve(individual), "retire");
    },

    async "society.die"(individual: string): Promise<CommandResult> {
      return archive(await resolve(individual), "die");
    },

    async "society.rehire"(pastNode: string): Promise<CommandResult> {
      const node = await resolve(pastNode);
      const ind = await rt.transform(node, C.individual);
      return ok(ind, "rehire");
    },

    // ---- Society: external injection ----

    async "society.teach"(
      individual: string,
      principle: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(principle);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.principle, principle, id);
      return ok(node, "teach");
    },

    async "society.train"(
      individual: string,
      procedure: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.procedure, procedure, id);
      return ok(node, "train");
    },

    // ---- Society: organization lifecycle ----

    async "society.found"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.organization, content, id, alias);
      return ok(node, "found");
    },

    async "society.dissolve"(org: string): Promise<CommandResult> {
      return archive(await resolve(org), "dissolve");
    },

    // ---- Society: crown ----

    async "society.crown"(individual: string): Promise<CommandResult> {
      const indNode = await resolve(individual);
      await rt.link(society, indNode, "crown", "crowned");
      return ok(indNode, "crown");
    },

    async "society.uncrown"(individual: string): Promise<CommandResult> {
      const indNode = await resolve(individual);
      await rt.unlink(society, indNode, "crown", "crowned");
      return ok(indNode, "uncrown");
    },

    // ---- Org ----

    async "org.charter"(org: string, charter: string, id?: string): Promise<CommandResult> {
      validateGherkin(charter);
      const node = await rt.create(await resolve(org), C.charter, charter, id);
      return ok(node, "charter");
    },

    async "org.hire"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.link(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "hire");
    },

    async "org.fire"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.unlink(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "fire");
    },

    async "org.admin"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.link(orgNode, await resolve(individual), "admin", "administer");
      return ok(orgNode, "admin");
    },

    async "org.unadmin"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.unlink(orgNode, await resolve(individual), "admin", "administer");
      return ok(orgNode, "unadmin");
    },
  };
}
