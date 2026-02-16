/**
 * McpState — stateful session for the MCP server.
 *
 * Holds what the stateless Rolex API does not:
 *   - activeRole (which individual is "me")
 *   - focusedGoal / focusedPlan (execution context)
 *   - id → Structure registry (resolve user-facing ids to node refs)
 *   - encounter / experience registries (for selective cognition)
 */
import type { Rolex, State, Structure } from "rolexjs";

export class McpState {
  activeRole: Structure | null = null;
  focusedGoal: Structure | null = null;
  focusedPlan: Structure | null = null;
  knowledgeRef: Structure | null = null;

  private refs = new Map<string, Structure>();
  private encounterRegistry = new Map<string, Structure>();
  private experienceRegistry = new Map<string, Structure>();

  constructor(readonly rolex: Rolex) {}

  // ================================================================
  //  Registry — id → Structure
  // ================================================================

  register(id: string, ref: Structure) {
    this.refs.set(id, ref);
  }

  resolve(id: string): Structure {
    const ref = this.refs.get(id);
    if (!ref) throw new Error(`Not found: "${id}"`);
    return ref;
  }

  unregister(id: string) {
    this.refs.delete(id);
  }

  // ================================================================
  //  Requirements — throw if missing
  // ================================================================

  requireRole(): Structure {
    if (!this.activeRole) throw new Error("No active role. Call activate first.");
    return this.activeRole;
  }

  requireGoal(): Structure {
    if (!this.focusedGoal) throw new Error("No focused goal. Call want first.");
    return this.focusedGoal;
  }

  requirePlan(): Structure {
    if (!this.focusedPlan) throw new Error("No focused plan. Call plan first.");
    return this.focusedPlan;
  }

  requireKnowledge(): Structure {
    if (!this.knowledgeRef) throw new Error("No knowledge branch found.");
    return this.knowledgeRef;
  }

  // ================================================================
  //  Cognition registries — encounter / experience (named, selective)
  // ================================================================

  registerEncounter(id: string, enc: Structure) {
    this.encounterRegistry.set(id, enc);
  }

  resolveEncounters(ids: string[]): Structure[] {
    return ids.map((id) => {
      const enc = this.encounterRegistry.get(id);
      if (!enc) throw new Error(`Encounter not found: "${id}"`);
      return enc;
    });
  }

  consumeEncounters(ids: string[]) {
    for (const id of ids) {
      this.encounterRegistry.delete(id);
    }
  }

  listEncounters(): string[] {
    return [...this.encounterRegistry.keys()];
  }

  registerExperience(id: string, exp: Structure) {
    this.experienceRegistry.set(id, exp);
  }

  resolveExperiences(ids: string[]): Structure[] {
    return ids.map((id) => {
      const exp = this.experienceRegistry.get(id);
      if (!exp) throw new Error(`Experience not found: "${id}"`);
      return exp;
    });
  }

  consumeExperiences(ids: string[]) {
    for (const id of ids) {
      this.experienceRegistry.delete(id);
    }
  }

  listExperiences(): string[] {
    return [...this.experienceRegistry.keys()];
  }

  // ================================================================
  //  Lookup — find individual by id/alias
  // ================================================================

  findIndividual(roleId: string): Structure | null {
    return this.rolex.find(roleId);
  }

  // ================================================================
  //  Activation helpers
  // ================================================================

  /** Cache child refs from an activation projection. */
  cacheFromActivation(state: State) {
    const children = (state as State & { children?: readonly State[] }).children;
    this.knowledgeRef = children?.find((c: State) => c.name === "knowledge") ?? null;
  }

  // ================================================================
  //  Cognitive hints — state-aware AI self-direction cues
  // ================================================================

  /** First-person, state-aware hint for the AI after an operation. */
  cognitiveHint(process: string): string | null {
    switch (process) {
      case "activate":
        if (!this.focusedGoal)
          return "I have no goal yet. I should call `want` to declare one, or `focus` to review existing goals.";
        return "I have an active goal. I should call `focus` to review progress, or `want` to declare a new goal.";

      case "focus":
        if (!this.focusedPlan)
          return "I have a goal but no plan. I should call `plan` to design how to achieve it.";
        return "I have a plan. I should call `todo` to create tasks, or continue working.";

      case "want":
        return "Goal declared. I should call `plan` to design how to achieve it.";

      case "plan":
        return "Plan created. I should call `todo` to create concrete tasks.";

      case "todo":
        return "Task created. I can add more with `todo`, or start working and call `finish` when done.";

      case "finish": {
        const encCount = this.encounterRegistry.size;
        if (encCount > 0 && !this.focusedGoal)
          return `Task finished. No more goals — I have ${encCount} encounter(s) to choose from for \`reflect\`, or \`want\` a new goal.`;
        return "Task finished. I should continue with remaining tasks, or call `achieve` when the goal is met.";
      }

      case "achieve":
      case "abandon": {
        const encCount = this.encounterRegistry.size;
        if (encCount > 0)
          return `Goal closed. I have ${encCount} encounter(s) to choose from for \`reflect\`, or I can \`want\` a new goal.`;
        return "Goal closed. I can call `want` for a new goal, or `focus` to review others.";
      }

      case "reflect": {
        const expCount = this.experienceRegistry.size;
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
