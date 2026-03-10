/**
 * Role — rich domain model (充血模型) for an individual.
 *
 * Role is a self-contained operation domain that holds:
 *   - State projection (read cache from graph)
 *   - Cursors (focusedGoalId, focusedPlanId)
 *   - Cognitive registries (encounters, experiences)
 *   - Domain behaviors (focus, want, plan, todo, finish, etc.)
 *
 * Design:
 *   - Role = Actor State, RoleX = ActorSystem
 *   - Ownership validation: hasNode() ensures isolation
 *   - KV-serializable: snapshot() / restore()
 *   - Single instance per individual
 */

import type { State } from "@rolexjs/system";
import type { CommandResult, Commands } from "./commands/index.js";
import type { Renderer } from "./renderer.js";

// ================================================================
//  Snapshot — KV-serializable state
// ================================================================

/** Serializable role state for KV persistence. */
export interface RoleSnapshot {
  id: string;
  focusedGoalId: string | null;
  focusedPlanId: string | null;
  encounterIds: string[];
  experienceIds: string[];
}

// ================================================================
//  RoleDeps — injected runtime dependencies (internal, not public)
// ================================================================

/** Internal dependencies injected by RoleX at activate time. */
export interface RoleDeps {
  commands: Commands;
  renderer: Renderer;
  onSave(snapshot: RoleSnapshot): void | Promise<void>;
  /** Direct execution — for `use` method. Provided by RoleXService. */
  direct?<T>(locator: string, args?: Record<string, unknown>): Promise<T>;
  /** Post-process `use` results (e.g., issue rendering). Provided by upper layer. */
  transformUseResult?<T>(locator: string, result: T): Promise<T>;
}

// ================================================================
//  Role — rich domain model
// ================================================================

export class Role {
  readonly id: string;

  private focusedGoalId: string | null = null;
  private focusedPlanId: string | null = null;
  private readonly encounterIds = new Set<string>();
  private readonly experienceIds = new Set<string>();

  /** Set of all node ids under this individual — for ownership validation. */
  private readonly nodeIds = new Set<string>();

  private deps: RoleDeps;

  constructor(id: string, deps: RoleDeps) {
    this.id = id;
    this.deps = deps;
  }

  // ================================================================
  //  State projection — populated at activate time
  // ================================================================

  /** Populate from state projection. Builds nodeIds set + cognitive registries. */
  hydrate(state: State): void {
    this.nodeIds.clear();
    this.encounterIds.clear();
    this.experienceIds.clear();
    this.focusedGoalId = null;
    this.walkState(state);
  }

  private walkState(node: State): void {
    if (node.id) {
      this.nodeIds.add(node.id);
      switch (node.name) {
        case "goal":
          if (!this.focusedGoalId) this.focusedGoalId = node.id;
          break;
        case "encounter":
          this.encounterIds.add(node.id);
          break;
        case "experience":
          this.experienceIds.add(node.id);
          break;
      }
    }
    for (const child of node.children ?? []) {
      this.walkState(child);
    }
  }

  // ================================================================
  //  Ownership validation
  // ================================================================

  private hasNode(id: string): boolean {
    return this.nodeIds.has(id);
  }

  private requireOwnership(id: string, label: string): void {
    if (!this.hasNode(id)) {
      throw new Error(`${label} "${id}" does not belong to individual "${this.id}".`);
    }
  }

  // ================================================================
  //  Cursor requirements
  // ================================================================

  private requireGoalId(): string {
    if (!this.focusedGoalId) throw new Error("No focused goal. Call want first.");
    return this.focusedGoalId;
  }

  private requirePlanId(): string {
    if (!this.focusedPlanId) throw new Error("No focused plan. Call plan first.");
    return this.focusedPlanId;
  }

  // ================================================================
  //  Rendering
  // ================================================================

  private fmt(command: string, result: CommandResult): string {
    const rendered = this.deps.renderer.render(command, result);
    const process = command.includes(".") ? command.slice(command.indexOf(".") + 1) : command;
    const ch = this.cognitiveHint(process);
    if (!ch) return rendered;
    const lines = rendered.split("\n");
    lines.splice(2, 0, `I → ${ch}`);
    return lines.join("\n");
  }

  // ================================================================
  //  Persistence
  // ================================================================

  private async save(): Promise<void> {
    await this.deps.onSave(this.snapshot());
  }

  /** Serialize to KV-compatible snapshot. */
  snapshot(): RoleSnapshot {
    return {
      id: this.id,
      focusedGoalId: this.focusedGoalId,
      focusedPlanId: this.focusedPlanId,
      encounterIds: [...this.encounterIds],
      experienceIds: [...this.experienceIds],
    };
  }

  /** Restore cursors and cognitive state from a snapshot. */
  restore(snap: RoleSnapshot): void {
    this.focusedGoalId = snap.focusedGoalId;
    this.focusedPlanId = snap.focusedPlanId;
    this.encounterIds.clear();
    for (const id of snap.encounterIds) this.encounterIds.add(id);
    this.experienceIds.clear();
    for (const id of snap.experienceIds) this.experienceIds.add(id);
  }

  // ================================================================
  //  Execution — focus, want, plan, todo, finish, complete, abandon
  // ================================================================

  /** Project the individual's state tree (used after activate). */
  async project(): Promise<string> {
    const result = await this.deps.commands["role.focus"](this.id);
    return this.fmt("role.activate", result);
  }

  /** Focus: view or switch focused goal. Validates ownership. */
  async focus(goal?: string): Promise<string> {
    const goalId = goal ?? this.requireGoalId();
    if (goal) {
      this.requireOwnership(goalId, "Goal");
    }
    const result = await this.deps.commands["role.focus"](goalId);
    if (result.state.name !== "goal") {
      throw new Error(
        `"${goalId}" is a ${result.state.name}, not a goal. focus only accepts goal ids.`
      );
    }
    const switched = goalId !== this.focusedGoalId;
    this.focusedGoalId = goalId;
    if (switched) this.focusedPlanId = null;
    await this.save();
    return this.fmt("role.focus", result);
  }

  /** Want: declare a goal under this individual. */
  async want(goal?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.deps.commands["role.want"](this.id, goal, id, alias);
    const newId = id ?? result.state.id;
    if (newId) {
      this.nodeIds.add(newId);
      this.focusedGoalId = newId;
    }
    this.focusedPlanId = null;
    await this.save();
    return this.fmt("role.want", result);
  }

  /** Plan: create a plan for the focused goal. */
  async plan(plan?: string, id?: string, after?: string, fallback?: string): Promise<string> {
    const result = await this.deps.commands["role.plan"](
      this.requireGoalId(),
      plan,
      id,
      after,
      fallback
    );
    const newId = id ?? result.state.id;
    if (newId) {
      this.nodeIds.add(newId);
      this.focusedPlanId = newId;
    }
    await this.save();
    return this.fmt("role.plan", result);
  }

  /** Todo: add a task to the focused plan. */
  async todo(task?: string, id?: string, alias?: readonly string[]): Promise<string> {
    const result = await this.deps.commands["role.todo"](this.requirePlanId(), task, id, alias);
    const newId = id ?? result.state.id;
    if (newId) this.nodeIds.add(newId);
    return this.fmt("role.todo", result);
  }

  /** Finish: complete a task, optionally record an encounter. */
  async finish(task: string, encounter?: string): Promise<string> {
    this.requireOwnership(task, "Task");
    const result = await this.deps.commands["role.finish"](task, this.id, encounter);
    if (encounter && result.state.id) {
      this.encounterIds.add(result.state.id);
      this.nodeIds.add(result.state.id);
    }
    return this.fmt("role.finish", result);
  }

  /** Complete: close a plan as done, record encounter. */
  async complete(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.requirePlanId();
    this.requireOwnership(planId, "Plan");
    const result = await this.deps.commands["role.complete"](planId, this.id, encounter);
    const encId = result.state.id ?? planId;
    this.encounterIds.add(encId);
    this.nodeIds.add(encId);
    if (this.focusedPlanId === planId) this.focusedPlanId = null;
    await this.save();
    return this.fmt("role.complete", result);
  }

  /** Abandon: drop a plan, record encounter. */
  async abandon(plan?: string, encounter?: string): Promise<string> {
    const planId = plan ?? this.requirePlanId();
    this.requireOwnership(planId, "Plan");
    const result = await this.deps.commands["role.abandon"](planId, this.id, encounter);
    const encId = result.state.id ?? planId;
    this.encounterIds.add(encId);
    this.nodeIds.add(encId);
    if (this.focusedPlanId === planId) this.focusedPlanId = null;
    await this.save();
    return this.fmt("role.abandon", result);
  }

  // ================================================================
  //  Cognition — reflect, realize, master
  // ================================================================

  /** Reflect: consume encounters → experience. */
  async reflect(encounters: string[], experience?: string, id?: string): Promise<string> {
    if (encounters.length > 0) {
      for (const enc of encounters) {
        if (!this.encounterIds.has(enc)) throw new Error(`Encounter not found: "${enc}"`);
      }
    }
    const first = encounters[0] as string | undefined;
    const result = await this.deps.commands["role.reflect"](first, this.id, experience, id);
    for (let i = 1; i < encounters.length; i++) {
      await this.deps.commands["role.forget"](encounters[i]);
    }
    if (encounters.length > 0) {
      for (const enc of encounters) this.encounterIds.delete(enc);
    }
    const newId = id ?? result.state.id;
    if (newId) {
      this.experienceIds.add(newId);
      this.nodeIds.add(newId);
    }
    return this.fmt("role.reflect", result);
  }

  /** Realize: consume experiences → principle. */
  async realize(experiences: string[], principle?: string, id?: string): Promise<string> {
    if (experiences.length > 0) {
      for (const exp of experiences) {
        if (!this.experienceIds.has(exp)) throw new Error(`Experience not found: "${exp}"`);
      }
    }
    const first = experiences[0] as string | undefined;
    const result = await this.deps.commands["role.realize"](first, this.id, principle, id);
    for (let i = 1; i < experiences.length; i++) {
      await this.deps.commands["role.forget"](experiences[i]);
    }
    if (experiences.length > 0) {
      for (const exp of experiences) this.experienceIds.delete(exp);
    }
    const newId = id ?? result.state.id;
    if (newId) this.nodeIds.add(newId);
    return this.fmt("role.realize", result);
  }

  /** Master: create procedure, optionally consuming experiences. */
  async master(procedure: string, id?: string, experiences?: string[]): Promise<string> {
    if (experiences && experiences.length > 0) {
      for (const exp of experiences) {
        if (!this.experienceIds.has(exp)) throw new Error(`Experience not found: "${exp}"`);
      }
    }
    const first = experiences?.[0];
    const result = await this.deps.commands["role.master"](this.id, procedure, id, first);
    if (experiences) {
      for (let i = 1; i < experiences.length; i++) {
        await this.deps.commands["role.forget"](experiences[i]);
      }
      for (const exp of experiences) this.experienceIds.delete(exp);
    }
    const newId = id ?? result.state.id;
    if (newId) this.nodeIds.add(newId);
    return this.fmt("role.master", result);
  }

  // ================================================================
  //  Knowledge management
  // ================================================================

  /** Forget: remove any node under this individual by id. */
  async forget(nodeId: string): Promise<string> {
    this.requireOwnership(nodeId, "Node");
    const result = await this.deps.commands["role.forget"](nodeId);
    this.nodeIds.delete(nodeId);
    if (this.focusedGoalId === nodeId) this.focusedGoalId = null;
    if (this.focusedPlanId === nodeId) this.focusedPlanId = null;
    this.encounterIds.delete(nodeId);
    this.experienceIds.delete(nodeId);
    await this.save();
    return this.fmt("role.forget", result);
  }

  // ================================================================
  //  Skills
  // ================================================================

  /** Skill: load full skill content by locator. */
  async skill(locator: string): Promise<string> {
    return await this.deps.commands["role.skill"](locator);
  }

  // ================================================================
  //  Use — subjective execution
  // ================================================================

  /** Use: subjective execution — `!ns.method` or ResourceX locator. */
  async use<T = unknown>(locator: string, args?: Record<string, unknown>): Promise<T> {
    if (!this.deps.direct) {
      throw new Error("Direct execution is not available on this Role instance.");
    }
    const result = await this.deps.direct<T>(locator, args);
    if (this.deps.transformUseResult) {
      return this.deps.transformUseResult<T>(locator, result);
    }
    return result;
  }

  // ================================================================
  //  Cognitive hints
  // ================================================================

  private cognitiveHint(process: string): string | null {
    switch (process) {
      case "activate":
        if (!this.focusedGoalId)
          return "I have no goal yet. I should call `want` to declare one, or `focus` to review existing goals.";
        return "I have an active goal. I should call `focus` to review progress, or `want` to declare a new goal.";

      case "focus":
        if (!this.focusedPlanId)
          return "I have a goal but no focused plan. I should call `plan` to create or focus on one.";
        return "I have a plan. I should call `todo` to create tasks, or continue working.";

      case "want":
        return "Goal declared. I should call `plan` to design how to achieve it.";

      case "plan":
        return "Plan created. I should call `todo` to create concrete tasks.";

      case "todo":
        return "Task created. I can add more with `todo`, or start working and call `finish` when done.";

      case "finish": {
        const encCount = this.encounterIds.size;
        if (encCount > 0 && !this.focusedGoalId)
          return `Task finished. No more goals — I have ${encCount} encounter(s) to choose from for \`reflect\`, or \`want\` a new goal.`;
        return "Task finished. I should continue with remaining tasks, or call `complete` when the plan is done.";
      }

      case "complete":
      case "abandon": {
        const encCount = this.encounterIds.size;
        const goalNote = this.focusedGoalId
          ? ` I should check if goal "${this.focusedGoalId}" needs a new \`plan\`, or \`forget\` it if the direction is fulfilled.`
          : "";
        if (encCount > 0)
          return `Plan closed.${goalNote} I have ${encCount} encounter(s) to choose from for \`reflect\`, or I can continue with other plans.`;
        return `Plan closed.${goalNote} I can create a new \`plan\`, or \`focus\` on another goal.`;
      }

      case "reflect": {
        const expCount = this.experienceIds.size;
        if (expCount > 0)
          return `Experience gained. I can \`realize\` principles or \`master\` procedures — ${expCount} experience(s) available.`;
        return "Experience gained. I can `realize` a principle, `master` a procedure, or continue working.";
      }

      case "realize":
        return "Principle added. I should continue working.";

      case "master":
        return "Procedure added. I should continue working.";

      default:
        return null;
    }
  }
}
