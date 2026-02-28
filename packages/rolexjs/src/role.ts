/**
 * Role — stateful handle returned by Rolex.activate().
 *
 * Holds roleId + RoleContext internally.
 * All operations return rendered 3-layer text (status + hint + projection).
 * MCP and CLI are pure pass-through — no render logic needed.
 *
 * Usage:
 *   const role = await rolex.activate("sean");
 *   role.want("Feature: Ship v1", "ship-v1");   // → rendered string
 *   role.plan("Feature: Phase 1", "phase-1");    // → rendered string
 *   role.finish("write-tests", "Feature: Tests written");
 */

import type { OpResult, Ops } from "@rolexjs/prototype";
import type { RoleContext } from "./context.js";
import { render } from "./render.js";

/**
 * Internal API surface that Role delegates to.
 * Constructed by Rolex.activate() — not part of public API.
 */
export interface RolexInternal {
  ops: Ops;
  saveCtx(ctx: RoleContext): void;
  direct<T>(locator: string, args?: Record<string, unknown>): Promise<T>;
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
  project(): string {
    const result = this.api.ops["role.focus"](this.roleId);
    const focusedGoalId = this.ctx.focusedGoalId;
    return this.fmt("activate", this.roleId, result, {
      fold: (node) => node.name === "goal" && node.id !== focusedGoalId,
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

  private save(): void {
    this.api.saveCtx(this.ctx);
  }

  // ---- Execution ----

  /** Focus: view or switch focused goal. */
  focus(goal?: string): string {
    const goalId = goal ?? this.ctx.requireGoalId();
    this.ctx.focusedGoalId = goalId;
    this.ctx.focusedPlanId = null;
    const result = this.api.ops["role.focus"](goalId);
    this.save();
    return this.fmt("focus", goalId, result);
  }

  /** Want: declare a goal. */
  want(goal?: string, id?: string, alias?: readonly string[]): string {
    const result = this.api.ops["role.want"](this.roleId, goal, id, alias);
    if (id) this.ctx.focusedGoalId = id;
    this.ctx.focusedPlanId = null;
    this.save();
    return this.fmt("want", id ?? this.roleId, result);
  }

  /** Plan: create a plan for the focused goal. */
  plan(plan?: string, id?: string, after?: string, fallback?: string): string {
    const result = this.api.ops["role.plan"](this.ctx.requireGoalId(), plan, id, after, fallback);
    if (id) this.ctx.focusedPlanId = id;
    this.save();
    return this.fmt("plan", id ?? "plan", result);
  }

  /** Todo: add a task to the focused plan. */
  todo(task?: string, id?: string, alias?: readonly string[]): string {
    const result = this.api.ops["role.todo"](this.ctx.requirePlanId(), task, id, alias);
    return this.fmt("todo", id ?? "task", result);
  }

  /** Finish: complete a task, optionally record an encounter. */
  finish(task: string, encounter?: string): string {
    const result = this.api.ops["role.finish"](task, this.roleId, encounter);
    if (encounter && result.state.id) {
      this.ctx.addEncounter(result.state.id);
    }
    return this.fmt("finish", task, result);
  }

  /** Complete: close a plan as done, record encounter. */
  complete(plan?: string, encounter?: string): string {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = this.api.ops["role.complete"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    this.save();
    return this.fmt("complete", planId, result);
  }

  /** Abandon: drop a plan, record encounter. */
  abandon(plan?: string, encounter?: string): string {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = this.api.ops["role.abandon"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    this.save();
    return this.fmt("abandon", planId, result);
  }

  // ---- Cognition ----

  /** Reflect: consume encounter → experience. Empty encounter = direct creation. */
  reflect(encounter?: string, experience?: string, id?: string): string {
    if (encounter) {
      this.ctx.requireEncounterIds([encounter]);
    }
    const result = this.api.ops["role.reflect"](encounter, this.roleId, experience, id);
    if (encounter) {
      this.ctx.consumeEncounters([encounter]);
    }
    if (id) this.ctx.addExperience(id);
    return this.fmt("reflect", id ?? "experience", result);
  }

  /** Realize: consume experience → principle. Empty experience = direct creation. */
  realize(experience?: string, principle?: string, id?: string): string {
    if (experience) {
      this.ctx.requireExperienceIds([experience]);
    }
    const result = this.api.ops["role.realize"](experience, this.roleId, principle, id);
    if (experience) {
      this.ctx.consumeExperiences([experience]);
    }
    return this.fmt("realize", id ?? "principle", result);
  }

  /** Master: create procedure, optionally consuming experience. */
  master(procedure: string, id?: string, experience?: string): string {
    if (experience) this.ctx.requireExperienceIds([experience]);
    const result = this.api.ops["role.master"](this.roleId, procedure, id, experience);
    if (experience) this.ctx.consumeExperiences([experience]);
    return this.fmt("master", id ?? "procedure", result);
  }

  // ---- Knowledge management ----

  /** Forget: remove any node under the individual by id. */
  forget(nodeId: string): string {
    const result = this.api.ops["role.forget"](nodeId);
    if (this.ctx.focusedGoalId === nodeId) this.ctx.focusedGoalId = null;
    if (this.ctx.focusedPlanId === nodeId) this.ctx.focusedPlanId = null;
    this.save();
    return this.fmt("forget", nodeId, result);
  }

  // ---- Skills + unified entry ----

  /** Skill: load full skill content by locator. */
  skill(locator: string): Promise<string> {
    return this.api.ops["role.skill"](locator);
  }

  /** Use: subjective execution — `!ns.method` or ResourceX locator. */
  use<T = unknown>(locator: string, args?: Record<string, unknown>): Promise<T> {
    return this.api.direct<T>(locator, args);
  }
}
