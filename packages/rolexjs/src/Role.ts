/**
 * Role — The embodied perspective of a role.
 *
 * First-person API: "I know, I want, I plan, I do, I finish."
 * Once constructed with a name, all operations are scoped to this role.
 */

import type { Platform, Feature, Goal, Plan, Task } from "@rolexjs/core";

export class Role {
  constructor(
    private readonly platform: Platform,
    private readonly name: string
  ) {}

  /** Who am I? Load my identity — my personality, knowledge, and principles. */
  identity(): Feature[] {
    return this.platform.identity(this.name);
  }

  /** What am I focused on? My current active goal with plan + tasks, plus other active goals. */
  focus(name?: string): {
    current: (Goal & { plan: Plan | null; tasks: Task[] }) | null;
    otherGoals: Goal[];
  } {
    if (name) {
      this.platform.setFocusedGoal(this.name, name);
    }

    const current = this.platform.activeGoal(this.name);
    const allActive = this.platform.allActiveGoals(this.name);

    // Other goals = all active goals except the current one
    const currentName = current?.name;
    const otherGoals = allActive.filter((g) => g.name !== currentName);

    return { current, otherGoals };
  }

  /** I want to achieve this. Set a new goal. */
  want(name: string, source: string, testable?: boolean): Goal {
    return this.platform.createGoal(this.name, name, source, testable);
  }

  /** I'm growing. Add knowledge, experience, or voice to my identity. */
  growup(type: "knowledge" | "experience" | "voice", name: string, source: string): Feature {
    return this.platform.growup(this.name, type, name, source);
  }

  /** Here's how I'll do it. Create a plan for my active goal. */
  plan(source: string): Plan {
    return this.platform.createPlan(this.name, source);
  }

  /** I need to do this. Add a task to my active goal. */
  todo(name: string, source: string, testable?: boolean): Task {
    return this.platform.createTask(this.name, name, source, testable);
  }

  /** Goal achieved. Mark as done, optionally capture what I learned. */
  achieve(experience?: string): void {
    this.platform.completeGoal(this.name, experience);
  }

  /** Goal abandoned. Mark as abandoned, optionally capture what I learned. */
  abandon(experience?: string): void {
    this.platform.abandonGoal(this.name, experience);
  }

  /** Task finished. Mark a task as @done. */
  finish(name: string): void {
    this.platform.completeTask(this.name, name);
  }
}
