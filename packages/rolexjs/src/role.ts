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

import type { CommandResult, Commands } from "@rolexjs/prototype";
import type { RoleContext } from "./context.js";
import { type IssueAction, type LabelResolver, renderIssueResult } from "./issue-render.js";
import type { Renderer } from "./renderers/renderer.js";

/**
 * Internal API surface that Role delegates to.
 * Constructed by Rolex.activate() — not part of public API.
 */
export interface RolexInternal {
  commands: Commands;
  renderer: Renderer;
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
    const result = await this.api.commands["role.focus"](this.roleId);
    return this.fmt("role.activate", result);
  }

  /** Render a CommandResult via the injected Renderer, with cognitive hint. */
  private fmt(command: string, result: CommandResult): string {
    const rendered = this.api.renderer.render(command, result);
    const process = command.includes(".") ? command.slice(command.indexOf(".") + 1) : command;
    const ch = this.ctx.cognitiveHint(process);
    if (!ch) return rendered;
    // Insert "I → ..." after the hint line (line 2), before the empty line
    const lines = rendered.split("\n");
    lines.splice(2, 0, `I → ${ch}`);
    return lines.join("\n");
  }

  private async save(): Promise<void> {
    await this.api.saveCtx(this.ctx);
  }

  // ---- Execution ----

  /** Focus: view or switch focused goal. Only accepts goal ids. */
  async focus(goal?: string): Promise<string> {
    const goalId = goal ?? this.ctx.requireGoalId();
    const result = await this.api.commands["role.focus"](goalId);
    if (result.state.name !== "goal") {
      throw new Error(
        `"${goalId}" is a ${result.state.name}, not a goal. focus only accepts goal ids.`
      );
    }
    const switched = goalId !== this.ctx.focusedGoalId;
    this.ctx.focusedGoalId = goalId;
    if (switched) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("role.focus", result);
  }

  /** Want: declare a goal. */
  async want(goal?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.api.commands["role.want"](this.roleId, goal, id, alias);
    if (id) this.ctx.focusedGoalId = id;
    this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("role.want", result);
  }

  /** Plan: create a plan for the focused goal. */
  async plan(plan?: string, id?: string, after?: string, fallback?: string): Promise<string> {
    const result = await this.api.commands["role.plan"](
      this.ctx.requireGoalId(),
      plan,
      id,
      after,
      fallback
    );
    if (id) this.ctx.focusedPlanId = id;
    await this.save();
    return this.fmt("role.plan", result);
  }

  /** Todo: add a task to the focused plan. */
  async todo(task?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.api.commands["role.todo"](this.ctx.requirePlanId(), task, id, alias);
    return this.fmt("role.todo", result);
  }

  /** Finish: complete a task, optionally record an encounter. */
  async finish(task: string, encounter?: string): Promise<string> {
    const result = await this.api.commands["role.finish"](task, this.roleId, encounter);
    if (encounter && result.state.id) {
      this.ctx.addEncounter(result.state.id);
    }
    return this.fmt("role.finish", result);
  }

  /** Complete: close a plan as done, record encounter. */
  async complete(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = await this.api.commands["role.complete"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("role.complete", result);
  }

  /** Abandon: drop a plan, record encounter. */
  async abandon(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = await this.api.commands["role.abandon"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("role.abandon", result);
  }

  // ---- Cognition ----

  /** Reflect: consume encounters → experience. Empty encounters = direct creation. */
  async reflect(encounters: string[], experience?: string, id?: string): Promise<string> {
    if (encounters.length > 0) {
      this.ctx.requireEncounterIds(encounters);
    }
    // First encounter goes through ops (creates experience + removes encounter)
    const first = encounters[0] as string | undefined;
    const result = await this.api.commands["role.reflect"](first, this.roleId, experience, id);
    // Remaining encounters are consumed via forget
    for (let i = 1; i < encounters.length; i++) {
      await this.api.commands["role.forget"](encounters[i]);
    }
    if (encounters.length > 0) {
      this.ctx.consumeEncounters(encounters);
    }
    if (id) this.ctx.addExperience(id);
    return this.fmt("role.reflect", result);
  }

  /** Realize: consume experiences → principle. Empty experiences = direct creation. */
  async realize(experiences: string[], principle?: string, id?: string): Promise<string> {
    if (experiences.length > 0) {
      this.ctx.requireExperienceIds(experiences);
    }
    // First experience goes through ops (creates principle + removes experience)
    const first = experiences[0] as string | undefined;
    const result = await this.api.commands["role.realize"](first, this.roleId, principle, id);
    // Remaining experiences are consumed via forget
    for (let i = 1; i < experiences.length; i++) {
      await this.api.commands["role.forget"](experiences[i]);
    }
    if (experiences.length > 0) {
      this.ctx.consumeExperiences(experiences);
    }
    return this.fmt("role.realize", result);
  }

  /** Master: create procedure, optionally consuming experiences. */
  async master(procedure: string, id?: string, experiences?: string[]): Promise<string> {
    if (experiences && experiences.length > 0) {
      this.ctx.requireExperienceIds(experiences);
    }
    // First experience goes through ops (creates procedure + removes experience)
    const first = experiences?.[0];
    const result = await this.api.commands["role.master"](this.roleId, procedure, id, first);
    // Remaining experiences are consumed via forget
    if (experiences) {
      for (let i = 1; i < experiences.length; i++) {
        await this.api.commands["role.forget"](experiences[i]);
      }
      this.ctx.consumeExperiences(experiences);
    }
    return this.fmt("role.master", result);
  }

  // ---- Knowledge management ----

  /** Forget: remove any node under the individual by id. */
  async forget(nodeId: string): Promise<string> {
    const result = await this.api.commands["role.forget"](nodeId);
    if (this.ctx.focusedGoalId === nodeId) this.ctx.focusedGoalId = null;
    if (this.ctx.focusedPlanId === nodeId) this.ctx.focusedPlanId = null;
    await this.save();
    return this.fmt("role.forget", result);
  }

  // ---- Skills + unified entry ----

  /** Skill: load full skill content by locator. */
  async skill(locator: string): Promise<string> {
    return await this.api.commands["role.skill"](locator);
  }

  /** Use: subjective execution — `!ns.method` or ResourceX locator. */
  async use<T = unknown>(locator: string, args?: Record<string, unknown>): Promise<T> {
    const result = await this.api.direct<T>(locator, args);
    // Render issue results as readable text (non-CommandResult, stays in upper layer)
    if (locator.startsWith("!issue.")) {
      const action = locator.slice("!issue.".length) as IssueAction;
      return (await renderIssueResult(action, result, this.api.resolveLabels)) as T;
    }
    // Render project results via renderer
    if (locator.startsWith("!project.")) {
      const command = locator.slice(1); // "project.launch" etc.
      return this.api.renderer.render(command, result as CommandResult) as T;
    }
    return result;
  }
}
