/**
 * McpState — stateful session for the MCP server.
 *
 * Holds what the stateless Rolex API does not:
 *   - activeRole (which individual is "me")
 *   - focusedGoal / focusedPlan (execution context)
 *   - name → Structure registry (resolve user-facing names to node refs)
 *   - encounter / experience stacks (for cognition flow)
 */
import type { Structure, State } from "rolexjs";
import type { Rolex } from "rolexjs";

export class McpState {
  activeRole: Structure | null = null;
  focusedGoal: Structure | null = null;
  focusedPlan: Structure | null = null;
  knowledgeRef: Structure | null = null;

  private refs = new Map<string, Structure>();
  private encounters: Structure[] = [];
  private experiences: Structure[] = [];

  constructor(readonly rolex: Rolex) {}

  // ================================================================
  //  Registry — name → Structure
  // ================================================================

  register(name: string, ref: Structure) {
    this.refs.set(name, ref);
  }

  resolve(name: string): Structure {
    const ref = this.refs.get(name);
    if (!ref) throw new Error(`Not found: "${name}"`);
    return ref;
  }

  unregister(name: string) {
    this.refs.delete(name);
  }

  // ================================================================
  //  Requirements — throw if missing
  // ================================================================

  requireRole(): Structure {
    if (!this.activeRole) throw new Error("No active role. Call identity first.");
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
  //  Cognition stacks — encounter / experience
  // ================================================================

  pushEncounter(enc: Structure) {
    this.encounters.push(enc);
  }

  popEncounter(): Structure {
    const enc = this.encounters.pop();
    if (!enc) throw new Error("No encounters to reflect on.");
    return enc;
  }

  pushExperience(exp: Structure) {
    this.experiences.push(exp);
  }

  popExperience(): Structure {
    const exp = this.experiences.pop();
    if (!exp) throw new Error("No experiences available.");
    return exp;
  }

  // ================================================================
  //  Lookup — find individual by roleId
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
    this.knowledgeRef =
      children?.find((c: State) => c.name === "knowledge") ?? null;
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

      case "finish":
        if (this.encounters.length > 0 && !this.focusedGoal)
          return "Task finished. No more goals — I can `reflect` on encounters, or `want` a new goal.";
        return "Task finished. I should continue with remaining tasks, or call `achieve` when the goal is met.";

      case "achieve":
      case "abandon":
        if (this.encounters.length > 0)
          return "Goal closed. I have encounters to `reflect` on, or I can `want` a new goal.";
        return "Goal closed. I can call `want` for a new goal, or `focus` to review others.";

      case "reflect":
        if (this.experiences.length > 0)
          return "Experience gained. I can `realize` principles or `master` skills from this experience.";
        return "Experience gained. I can `realize` a principle, `master` a skill, or continue working.";

      case "realize":
        return "Principle added to knowledge. I should continue working.";

      case "master":
        return "Skill added to knowledge. I should continue working.";

      default:
        return null;
    }
  }
}
