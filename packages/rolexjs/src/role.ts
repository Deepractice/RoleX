/**
 * Role — stateful handle returned by Rolex.activate().
 *
 * Holds roleId + RoleContext internally.
 * All operations return rendered 3-layer text (status + hint + projection).
 * MCP and CLI are pure pass-through — no render logic needed.
 *
 * Usage:
 *   const role = await rolex.activate("sean");
 *   await role.want("Feature: Ship v1", "ship-v1");   // → rendered string
 *   await role.plan("Feature: Phase 1", "phase-1");    // → rendered string
 *   await role.finish("write-tests", "Feature: Tests written");
 */

import type { OpResult, Ops } from "@rolexjs/prototype";
import type { RoleContext } from "./context.js";
import { type IssueAction, type LabelResolver, renderIssueResult } from "./issue-render.js";
import { type ProjectAction, renderProjectResult } from "./project-render.js";
import { render } from "./render.js";

/**
 * Internal API surface that Role delegates to.
 * Constructed by Rolex.activate() — not part of public API.
 */
export interface RolexInternal {
  ops: Ops;
  saveCtx(ctx: RoleContext): void | Promise<void>;
  direct<T>(locator: string, args?: Record<string, unknown>): Promise<T>;
  resolveLabels?: LabelResolver;
}

export class Role {
  readonly roleId: string;
  readonly ctx: RoleContext;
  private api: RolexInternal;

  constructor(roleId: string, ctx: RoleContext, api: RolexInternal) {
    this.roleId = roleId;
    this.ctx = ctx;
    this.api = api;
  }

  /** Project the individual's full state tree (used after activate). */
  async project(): Promise<string> {
    const result = await this.api.ops["role.focus"](this.roleId);
    const focusedGoalId = this.ctx.focusedGoalId;
    return this.fmt("activate", this.roleId, result, {
      fold: (node) =>
        (node.name === "goal" && node.id !== focusedGoalId) || node.name === "requirement",
    });
  }

  /** Render an OpResult into a 3-layer output string. */
  private fmt(
    process: string,
    name: string,
    result: OpResult,
    extra?: { fold?: (node: import("@rolexjs/system").State) => boolean }
  ): string {
    return render({
      process,
      name,
      state: result.state,
      cognitiveHint: this.ctx.cognitiveHint(process) ?? null,
      fold: extra?.fold,
    });
  }

  private async save(): Promise<void> {
    await this.api.saveCtx(this.ctx);
  }

  // ---- Execution ----

  /** Focus: view or switch focused goal. Only accepts goal ids. */
  async focus(goal?: string): Promise<string> {
    const goalId = goal ?? this.ctx.requireGoalId();
    const result = await this.api.ops["role.focus"](goalId);
    if (result.state.name !== "goal") {
      throw new Error(
        `"${goalId}" is a ${result.state.name}, not a goal. focus only accepts goal ids.`
      );
    }
    const switched = goalId !== this.ctx.focusedGoalId;
    this.ctx.focusedGoalId = goalId;
    if (switched) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("focus", goalId, result);
  }

  /** Want: declare a goal. */
  async want(goal?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.api.ops["role.want"](this.roleId, goal, id, alias);
    if (id) this.ctx.focusedGoalId = id;
    this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("want", id ?? this.roleId, result);
  }

  /** Plan: create a plan for the focused goal. */
  async plan(plan?: string, id?: string, after?: string, fallback?: string): Promise<string> {
    const result = await this.api.ops["role.plan"](
      this.ctx.requireGoalId(),
      plan,
      id,
      after,
      fallback
    );
    if (id) this.ctx.focusedPlanId = id;
    await this.save();
    return this.fmt("plan", id ?? "plan", result);
  }

  /** Todo: add a task to the focused plan. */
  async todo(task?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.api.ops["role.todo"](this.ctx.requirePlanId(), task, id, alias);
    return this.fmt("todo", id ?? "task", result);
  }

  /** Finish: complete a task, optionally record an encounter. */
  async finish(task: string, encounter?: string): Promise<string> {
    const result = await this.api.ops["role.finish"](task, this.roleId, encounter);
    if (encounter && result.state.id) {
      this.ctx.addEncounter(result.state.id);
    }
    return this.fmt("finish", task, result);
  }

  /** Complete: close a plan as done, record encounter. */
  async complete(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = await this.api.ops["role.complete"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("complete", planId, result);
  }

  /** Abandon: drop a plan, record encounter. */
  async abandon(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = await this.api.ops["role.abandon"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("abandon", planId, result);
  }

  // ---- Cognition ----

  /** Reflect: consume encounters → experience. Empty encounters = direct creation. */
  async reflect(encounters: string[], experience?: string, id?: string): Promise<string> {
    if (encounters.length > 0) {
      this.ctx.requireEncounterIds(encounters);
    }
    // First encounter goes through ops (creates experience + removes encounter)
    const first = encounters[0] as string | undefined;
    const result = await this.api.ops["role.reflect"](first, this.roleId, experience, id);
    // Remaining encounters are consumed via forget
    for (let i = 1; i < encounters.length; i++) {
      await this.api.ops["role.forget"](encounters[i]);
    }
    if (encounters.length > 0) {
      this.ctx.consumeEncounters(encounters);
    }
    if (id) this.ctx.addExperience(id);
    return this.fmt("reflect", id ?? "experience", result);
  }

  /** Realize: consume experiences → principle. Empty experiences = direct creation. */
  async realize(experiences: string[], principle?: string, id?: string): Promise<string> {
    if (experiences.length > 0) {
      this.ctx.requireExperienceIds(experiences);
    }
    // First experience goes through ops (creates principle + removes experience)
    const first = experiences[0] as string | undefined;
    const result = await this.api.ops["role.realize"](first, this.roleId, principle, id);
    // Remaining experiences are consumed via forget
    for (let i = 1; i < experiences.length; i++) {
      await this.api.ops["role.forget"](experiences[i]);
    }
    if (experiences.length > 0) {
      this.ctx.consumeExperiences(experiences);
    }
    return this.fmt("realize", id ?? "principle", result);
  }

  /** Master: create procedure, optionally consuming experiences. */
  async master(procedure: string, id?: string, experiences?: string[]): Promise<string> {
    if (experiences && experiences.length > 0) {
      this.ctx.requireExperienceIds(experiences);
    }
    // First experience goes through ops (creates procedure + removes experience)
    const first = experiences?.[0];
    const result = await this.api.ops["role.master"](this.roleId, procedure, id, first);
    // Remaining experiences are consumed via forget
    if (experiences) {
      for (let i = 1; i < experiences.length; i++) {
        await this.api.ops["role.forget"](experiences[i]);
      }
      this.ctx.consumeExperiences(experiences);
    }
    return this.fmt("master", id ?? "procedure", result);
  }

  // ---- Knowledge management ----

  /** Forget: remove any node under the individual by id. */
  async forget(nodeId: string): Promise<string> {
    const result = await this.api.ops["role.forget"](nodeId);
    if (this.ctx.focusedGoalId === nodeId) this.ctx.focusedGoalId = null;
    if (this.ctx.focusedPlanId === nodeId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("forget", nodeId, result);
  }

  // ---- Skills + unified entry ----

  /** Skill: load full skill content by locator. */
  async skill(locator: string): Promise<string> {
    return await this.api.ops["role.skill"](locator);
  }

  /** Use: subjective execution — `!ns.method` or ResourceX locator. */
  async use<T = unknown>(locator: string, args?: Record<string, unknown>): Promise<T> {
    const result = await this.api.direct<T>(locator, args);
    // Render issue results as readable text
    if (locator.startsWith("!issue.")) {
      const action = locator.slice("!issue.".length) as IssueAction;
      return (await renderIssueResult(action, result, this.api.resolveLabels)) as T;
    }
    // Render project results as readable text
    if (locator.startsWith("!project.")) {
      const action = locator.slice("!project.".length) as ProjectAction;
      const opResult = result as { state: import("@rolexjs/system").State };
      return renderProjectResult(action, opResult.state) as T;
    }
    return result;
  }
}
