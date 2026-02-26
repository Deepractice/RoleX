/**
 * Role — stateful handle returned by Rolex.activate().
 *
 * Holds roleId + RoleContext internally.
 * All operations are from the role's perspective — no need to pass
 * individual or ctx.
 *
 * Usage:
 *   const role = await rolex.activate("sean");
 *   role.want("Feature: Ship v1", "ship-v1");
 *   role.plan("Feature: Phase 1", "phase-1");
 *   role.finish("write-tests", "Feature: Tests written");
 */
import type { State } from "@rolexjs/system";
import type { Ops } from "@rolexjs/prototype";
import type { RoleContext } from "./context.js";

export interface RolexResult {
  /** Projection of the primary affected node. */
  state: State;
  /** Which process was executed (for render). */
  process: string;
  /** Cognitive hint — populated when RoleContext is used. */
  hint?: string;
  /** Role context — returned by activate. */
  ctx?: RoleContext;
}

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

  /** Project the individual's full state tree. */
  project(): RolexResult {
    const result = this.api.ops["role.focus"](this.roleId);
    return this.withHint({ ...result, process: "activate" }, "activate");
  }

  private withHint(result: RolexResult, process: string): RolexResult {
    result.hint = this.ctx.cognitiveHint(process) ?? undefined;
    return result;
  }

  private save(): void {
    this.api.saveCtx(this.ctx);
  }

  // ---- Execution ----

  /** Focus: view or switch focused goal. */
  focus(goal?: string): RolexResult {
    const goalId = goal ?? this.ctx.requireGoalId();
    this.ctx.focusedGoalId = goalId;
    this.ctx.focusedPlanId = null;
    const result = this.api.ops["role.focus"](goalId);
    this.save();
    return this.withHint(result, "focus");
  }

  /** Want: declare a goal. */
  want(goal?: string, id?: string, alias?: readonly string[]): RolexResult {
    const result = this.api.ops["role.want"](this.roleId, goal, id, alias);
    if (id) this.ctx.focusedGoalId = id;
    this.ctx.focusedPlanId = null;
    this.save();
    return this.withHint(result, "want");
  }

  /** Plan: create a plan for the focused goal. */
  plan(plan?: string, id?: string, after?: string, fallback?: string): RolexResult {
    const result = this.api.ops["role.plan"](this.ctx.requireGoalId(), plan, id, after, fallback);
    if (id) this.ctx.focusedPlanId = id;
    this.save();
    return this.withHint(result, "plan");
  }

  /** Todo: add a task to the focused plan. */
  todo(task?: string, id?: string, alias?: readonly string[]): RolexResult {
    const result = this.api.ops["role.todo"](this.ctx.requirePlanId(), task, id, alias);
    return this.withHint(result, "todo");
  }

  /** Finish: complete a task, optionally record an encounter. */
  finish(task: string, encounter?: string): RolexResult {
    const result = this.api.ops["role.finish"](task, this.roleId, encounter);
    if (encounter && result.state.id) {
      this.ctx.addEncounter(result.state.id);
    }
    return this.withHint(result, "finish");
  }

  /** Complete: close a plan as done, record encounter. */
  complete(plan?: string, encounter?: string): RolexResult {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = this.api.ops["role.complete"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    this.save();
    return this.withHint(result, "complete");
  }

  /** Abandon: drop a plan, record encounter. */
  abandon(plan?: string, encounter?: string): RolexResult {
    const planId = plan ?? this.ctx.requirePlanId();
    const result = this.api.ops["role.abandon"](planId, this.roleId, encounter);
    this.ctx.addEncounter(result.state.id ?? planId);
    if (this.ctx.focusedPlanId === planId) this.ctx.focusedPlanId = null;
    this.save();
    return this.withHint(result, "abandon");
  }

  // ---- Cognition ----

  /** Reflect: consume encounter, create experience. */
  reflect(encounter: string, experience?: string, id?: string): RolexResult {
    this.ctx.requireEncounterIds([encounter]);
    const result = this.api.ops["role.reflect"](encounter, this.roleId, experience, id);
    this.ctx.consumeEncounters([encounter]);
    if (id) this.ctx.addExperience(id);
    return this.withHint(result, "reflect");
  }

  /** Realize: consume experience, create principle. */
  realize(experience: string, principle?: string, id?: string): RolexResult {
    this.ctx.requireExperienceIds([experience]);
    const result = this.api.ops["role.realize"](experience, this.roleId, principle, id);
    this.ctx.consumeExperiences([experience]);
    return this.withHint(result, "realize");
  }

  /** Master: create procedure, optionally consuming experience. */
  master(procedure: string, id?: string, experience?: string): RolexResult {
    if (experience) this.ctx.requireExperienceIds([experience]);
    const result = this.api.ops["role.master"](this.roleId, procedure, id, experience);
    if (experience) this.ctx.consumeExperiences([experience]);
    return this.withHint(result, "master");
  }

  // ---- Knowledge management ----

  /** Forget: remove any node under the individual by id. */
  forget(nodeId: string): RolexResult {
    const result = this.api.ops["role.forget"](nodeId);
    if (this.ctx.focusedGoalId === nodeId) this.ctx.focusedGoalId = null;
    if (this.ctx.focusedPlanId === nodeId) this.ctx.focusedPlanId = null;
    this.save();
    return result;
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
