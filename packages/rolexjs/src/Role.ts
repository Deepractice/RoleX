/**
 * Role — The embodied perspective of a role.
 *
 * First-person API: "I know, I want, I plan, I do, I finish."
 * Once constructed with a roleId, all operations are scoped to this role.
 */

import type { Platform, Feature, Goal, Plan, Task } from "@rolexjs/core";

export class Role {
  constructor(
    private readonly platform: Platform,
    private readonly roleId: string,
  ) {}

  /** Who am I? Load my identity — my personality, knowledge, and principles. */
  identity(): Feature[] {
    return this.platform.identity(this.roleId);
  }

  /** What am I focused on? My current active goal with plan + tasks. */
  focus(): (Goal & { plan: Plan | null; tasks: Task[] }) | null {
    return this.platform.activeGoal(this.roleId);
  }

  /** I want to achieve this. Set a new goal. */
  want(name: string, source: string, testable?: boolean): Goal {
    return this.platform.createGoal(this.roleId, name, source, testable);
  }

  /** I'm growing. Add knowledge, experience, or voice to my identity. */
  growup(type: "knowledge" | "experience" | "voice", name: string, source: string): Feature {
    return this.platform.growup(this.roleId, type, name, source);
  }

  /** Here's how I'll do it. Create a plan for my active goal. */
  plan(source: string): Plan {
    return this.platform.createPlan(this.roleId, source);
  }

  /** I need to do this. Add a task to my active goal. */
  todo(name: string, source: string, testable?: boolean): Task {
    return this.platform.createTask(this.roleId, name, source, testable);
  }

  /** Goal achieved. Mark as done, optionally capture what I learned. */
  achieve(experience?: string): void {
    this.platform.completeGoal(this.roleId, experience);
  }

  /** Goal abandoned. Mark as abandoned, optionally capture what I learned. */
  abandon(experience?: string): void {
    this.platform.abandonGoal(this.roleId, experience);
  }

  /** Task finished. Mark a task as @done. */
  finish(name: string): void {
    this.platform.completeTask(this.roleId, name);
  }
}
