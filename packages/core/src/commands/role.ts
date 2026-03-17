/**
 * Commands — role.* commands.
 */

import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

// ================================================================
//  Role commands
// ================================================================

export function roleCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, resolve } = ctx;
  const { ok, validateGherkin, removeExisting } = helpers;

  return {
    // ---- Role: focus ----

    async "role.focus"(goal: string): Promise<CommandResult> {
      return ok(await resolve(goal), "focus");
    },

    // ---- Role: execution ----

    async "role.want"(
      individual: string,
      goal?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(goal);
      const node = await rt.create(await resolve(individual), C.goal, goal, id, alias);
      return ok(node, "want");
    },

    async "role.plan"(
      goal: string,
      plan?: string,
      id?: string,
      after?: string,
      fallback?: string
    ): Promise<CommandResult> {
      validateGherkin(plan);
      const node = await rt.create(await resolve(goal), C.plan, plan, id);
      if (after) await rt.link(node, await resolve(after), "after", "before");
      if (fallback) await rt.link(node, await resolve(fallback), "fallback-for", "fallback");
      return ok(node, "plan");
    },

    async "role.todo"(
      plan: string,
      task?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(task);
      const node = await rt.create(await resolve(plan), C.task, task, id, alias);
      return ok(node, "todo");
    },

    async "role.finish"(
      task: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const taskNode = await resolve(task);
      await rt.tag(taskNode, "done");
      if (encounter) {
        const encId = taskNode.id ? `${taskNode.id}-finished` : undefined;
        const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
        return ok(enc, "finish");
      }
      return ok(taskNode, "finish");
    },

    async "role.complete"(
      plan: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const planNode = await resolve(plan);
      await rt.tag(planNode, "done");
      const encId = planNode.id ? `${planNode.id}-completed` : undefined;
      const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "complete");
    },

    async "role.abandon"(
      plan: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const planNode = await resolve(plan);
      await rt.tag(planNode, "abandoned");
      const encId = planNode.id ? `${planNode.id}-abandoned` : undefined;
      const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "abandon");
    },

    // ---- Role: cognition ----

    async "role.reflect"(
      encounter: string | undefined,
      individual: string,
      experience?: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(experience);
      if (encounter) {
        const encNode = await resolve(encounter);
        const exp = await rt.create(
          await resolve(individual),
          C.experience,
          experience || encNode.information,
          id
        );
        await rt.remove(encNode);
        return ok(exp, "reflect");
      }
      // Direct creation — no encounter to consume
      const exp = await rt.create(await resolve(individual), C.experience, experience, id);
      return ok(exp, "reflect");
    },

    async "role.realize"(
      experience: string | undefined,
      individual: string,
      principle?: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(principle);
      if (experience) {
        const expNode = await resolve(experience);
        const prin = await rt.create(
          await resolve(individual),
          C.principle,
          principle || expNode.information,
          id
        );
        await rt.remove(expNode);
        return ok(prin, "realize");
      }
      // Direct creation — no experience to consume
      const prin = await rt.create(await resolve(individual), C.principle, principle, id);
      return ok(prin, "realize");
    },

    async "role.master"(
      individual: string,
      procedure: string,
      id?: string,
      experience?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const proc = await rt.create(parent, C.procedure, procedure, id);
      if (experience) await rt.remove(await resolve(experience));
      return ok(proc, "master");
    },

    // ---- Role: knowledge management ----

    async "role.forget"(nodeId: string): Promise<CommandResult> {
      const node = await resolve(nodeId);
      await rt.remove(node);
      return { state: { ...node, children: [] }, process: "forget" };
    },
  };
}
