/**
 * Commands — project.* commands.
 */

import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

export function projectCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, society, resolve } = ctx;
  const { ok, archive, validateGherkin } = helpers;

  return {
    async "project.launch"(
      content?: string,
      id?: string,
      alias?: readonly string[],
      org?: string
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.project, content, id, alias);
      if (org) await rt.link(node, await resolve(org), "ownership", "project");
      return ok(node, "launch");
    },

    async "project.scope"(project: string, scope: string, id?: string): Promise<CommandResult> {
      validateGherkin(scope);
      const node = await rt.create(await resolve(project), C.scope, scope, id);
      return ok(node, "scope");
    },

    async "project.milestone"(
      project: string,
      milestone: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(milestone);
      const node = await rt.create(await resolve(project), C.milestone, milestone, id);
      return ok(node, "milestone");
    },

    async "project.achieve"(milestone: string): Promise<CommandResult> {
      const node = await resolve(milestone);
      await rt.tag(node, "done");
      return ok(node, "achieve");
    },

    async "project.enroll"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.link(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "enroll");
    },

    async "project.remove"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.unlink(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "remove");
    },

    async "project.deliver"(
      project: string,
      deliverable: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(deliverable);
      const node = await rt.create(await resolve(project), C.deliverable, deliverable, id);
      return ok(node, "deliver");
    },

    async "project.wiki"(project: string, wiki: string, id?: string): Promise<CommandResult> {
      validateGherkin(wiki);
      const node = await rt.create(await resolve(project), C.wiki, wiki, id);
      return ok(node, "wiki");
    },

    async "project.archive"(project: string): Promise<CommandResult> {
      return archive(await resolve(project), "archive");
    },

    async "project.produce"(
      project: string,
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const projNode = await resolve(project);
      const node = await rt.create(society, C.product, content, id, alias);
      // Bidirectional link: project → product (production), product → project (origin)
      await rt.link(projNode, node, "production", "produce");
      await rt.link(node, projNode, "origin", "produced-by");
      return ok(node, "produce");
    },

    async "project.maintain"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.link(projNode, await resolve(individual), "maintain", "maintained-by");
      return ok(projNode, "maintain");
    },

    async "project.unmaintain"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.unlink(projNode, await resolve(individual), "maintain", "maintained-by");
      return ok(projNode, "unmaintain");
    },
  };
}
