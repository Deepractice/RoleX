/**
 * Platform — The abstraction layer for role storage.
 *
 * Defines how roles are loaded and persisted.
 * LocalPlatform uses the filesystem (.rolex/ directories).
 * Future platforms could use databases, cloud storage, etc.
 *
 * All methods are stateless — role name is passed per call.
 */

import type { Feature } from "./Feature.js";
import type { Goal } from "./Goal.js";
import type { Plan } from "./Plan.js";
import type { Task } from "./Task.js";

/**
 * Role entry in the organization.
 */
export interface RoleEntry {
  readonly name: string;
  readonly team: string;
}

/**
 * Organization structure.
 */
export interface Organization {
  readonly name: string;
  readonly roles: RoleEntry[];
}

/**
 * Society directory — all known roles and organizations.
 */
export interface Directory {
  readonly roles: readonly RoleEntry[];
  readonly organizations: readonly { readonly name: string }[];
}

/**
 * Platform interface — abstracts role storage and retrieval.
 * All methods are stateless — role name identifies the target role.
 */
export interface Platform {
  /** Found an organization */
  found(name: string): void;

  /** Get the organization structure (teams + roles) */
  organization(): Organization;

  /** Create a new role with its persona */
  born(name: string, source: string): Feature;

  /** Hire a role into the organization — establish CAS link */
  hire(name: string): void;

  /** Fire a role from the organization — remove CAS link */
  fire(name: string): void;

  /** Load all identity features for a role */
  identity(roleId: string): Feature[];

  /** Add a growth dimension to a role's identity */
  growup(roleId: string, type: "knowledge" | "experience" | "voice", name: string, source: string): Feature;

  /** Find the current active goal for a role (with plan + tasks context) */
  activeGoal(roleId: string): (Goal & { plan: Plan | null; tasks: Task[] }) | null;

  /** Create a new goal from Gherkin source */
  createGoal(roleId: string, name: string, source: string, testable?: boolean): Goal;

  /** Create a plan for the current active goal */
  createPlan(roleId: string, source: string): Plan;

  /** Create a task for the current active goal */
  createTask(roleId: string, name: string, source: string, testable?: boolean): Task;

  /** Mark the current active goal as done, optionally with experience reflection */
  completeGoal(roleId: string, experience?: string): void;

  /** Abandon the current active goal, optionally with experience reflection */
  abandonGoal(roleId: string, experience?: string): void;

  /** Mark a task as done */
  completeTask(roleId: string, name: string): void;
}
