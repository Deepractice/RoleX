/**
 * McpState — stateful session for the MCP server.
 *
 * Holds what the stateless Rolex API does not:
 *   - activeRoleId (which individual is "me")
 *   - focusedGoalId / focusedPlanId (execution context)
 *   - encounter / experience id sets (for selective cognition)
 *
 * Since the Rolex API now accepts string ids directly,
 * McpState only stores ids — no Structure references.
 */
import type { Rolex, State } from "rolexjs";

export class McpState {
  activeRoleId: string | null = null;
  focusedGoalId: string | null = null;
  focusedPlanId: string | null = null;

  private encounterIds = new Set<string>();
  private experienceIds = new Set<string>();

  constructor(readonly rolex: Rolex) {}

  // ================================================================
  //  Requirements — throw if missing
  // ================================================================

  requireRoleId(): string {
    if (!this.activeRoleId) throw new Error("No active role. Call activate first.");
    return this.activeRoleId;
  }

  requireGoalId(): string {
    if (!this.focusedGoalId) throw new Error("No focused goal. Call want first.");
    return this.focusedGoalId;
  }

  requirePlanId(): string {
    if (!this.focusedPlanId) throw new Error("No focused plan. Call plan first.");
    return this.focusedPlanId;
  }

  // ================================================================
  //  Cognition registries — encounter / experience ids
  // ================================================================

  addEncounter(id: string) {
    this.encounterIds.add(id);
  }

  requireEncounterIds(ids: string[]) {
    for (const id of ids) {
      if (!this.encounterIds.has(id)) throw new Error(`Encounter not found: "${id}"`);
    }
  }

  consumeEncounters(ids: string[]) {
    for (const id of ids) {
      this.encounterIds.delete(id);
    }
  }

  addExperience(id: string) {
    this.experienceIds.add(id);
  }

  requireExperienceIds(ids: string[]) {
    for (const id of ids) {
      if (!this.experienceIds.has(id)) throw new Error(`Experience not found: "${id}"`);
    }
  }

  consumeExperiences(ids: string[]) {
    for (const id of ids) {
      this.experienceIds.delete(id);
    }
  }

  // ================================================================
  //  Lookup
  // ================================================================

  findIndividual(roleId: string): boolean {
    return this.rolex.find(roleId) !== null;
  }

  // ================================================================
  //  Activation helpers
  // ================================================================

  /** Rehydrate ids from an activation projection. */
  cacheFromActivation(state: State) {
    this.rehydrate(state);
  }

  /** Walk the state tree and collect ids into the appropriate registries. */
  private rehydrate(node: State) {
    if (node.id) {
      switch (node.name) {
        case "goal":
          // Set focused goal to the first one found if none set
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
    for (const child of (node as State & { children?: readonly State[] }).children ?? []) {
      this.rehydrate(child);
    }
  }

  // ================================================================
  //  Cognitive hints — state-aware AI self-direction cues
  // ================================================================

  /** First-person, state-aware hint for the AI after an operation. */
  cognitiveHint(process: string): string | null {
    switch (process) {
      case "activate":
        if (!this.focusedGoalId)
          return "I have no goal yet. I should call `want` to declare one, or `focus` to review existing goals.";
        return "I have an active goal. I should call `focus` to review progress, or `want` to declare a new goal.";

      case "focus":
        if (!this.focusedPlanId)
          return "I have a goal but no plan. I should call `plan` to design how to achieve it.";
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
        if (encCount > 0)
          return `Plan closed. I have ${encCount} encounter(s) to choose from for \`reflect\`, or I can continue with other plans.`;
        return "Plan closed. I can create a new `plan`, or `focus` on another goal.";
      }

      case "reflect": {
        const expCount = this.experienceIds.size;
        if (expCount > 0)
          return `Experience gained. I can \`realize\` principles or \`master\` procedures — ${expCount} experience(s) available.`;
        return "Experience gained. I can `realize` a principle, `master` a procedure, or continue working.";
      }

      case "realize":
        return "Principle added to knowledge. I should continue working.";

      case "master":
        return "Procedure added to knowledge. I should continue working.";

      default:
        return null;
    }
  }
}
