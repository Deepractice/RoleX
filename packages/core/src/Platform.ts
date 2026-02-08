/**
 * Platform — The abstraction layer for role storage.
 *
 * Defines how roles, organizations, and positions are stored and managed.
 * LocalPlatform uses the filesystem (.rolex/ directories).
 * Future platforms could use databases, cloud storage, etc.
 *
 * Three-entity architecture:
 *   Role         = WHO  (identity, goals)
 *   Organization = WHERE (structure, nesting)
 *   Position     = WHAT  (duties, boundaries)
 *
 * All methods are stateless — entity names are passed per call.
 */

import type { Feature } from "./Feature.js";
import type { Goal } from "./Goal.js";
import type { Plan } from "./Plan.js";
import type { Task } from "./Task.js";
import type { Duty } from "./Duty.js";
import type { RoleState, PositionState } from "./model/states.js";

// ========== Config ==========

/**
 * Assignment — tracks which org/position a role is assigned to.
 */
export interface Assignment {
  readonly org: string;
  readonly position?: string;
}

/**
 * OrganizationConfig — stored config for an organization.
 */
export interface OrganizationConfig {
  readonly parent?: string;
  readonly positions: string[];
}

/**
 * RolexConfig — The single source of truth for society state.
 *
 * Always exists. Defined in core, persisted by Platform.
 */
export interface RolexConfig {
  roles: string[];
  organizations: Record<string, OrganizationConfig>;
  assignments: Record<string, Assignment>;
}

// ========== Runtime Views ==========

/**
 * Organization info (runtime view).
 */
export interface OrganizationInfo {
  readonly name: string;
  readonly parent?: string;
  readonly positions: string[];
  readonly members: string[];
}

/**
 * Position info (runtime view).
 */
export interface PositionInfo {
  readonly name: string;
  readonly org: string;
  readonly state: PositionState;
  readonly assignedRole: string | null;
  readonly duties: Duty[];
}

/**
 * Role directory entry with state information.
 */
export interface RoleEntry {
  readonly name: string;
  readonly state: RoleState;
  readonly org?: string;
  readonly position?: string;
}

/**
 * Society directory — all known roles, organizations, and positions.
 */
export interface Directory {
  readonly roles: readonly RoleEntry[];
  readonly organizations: readonly OrganizationInfo[];
}

/**
 * Platform interface — abstracts entity storage and retrieval.
 */
export interface Platform {
  // ========== Society ==========

  /** List all born roles in society */
  allBornRoles(): string[];

  /** Create a new role with its persona */
  born(name: string, source: string): Feature;

  /** Found an organization, optionally with a parent org and description */
  found(name: string, source?: string, parent?: string): void;

  /** Get organization info by name */
  getOrganization(name: string): OrganizationInfo | null;

  /** List all organizations */
  allOrganizations(): OrganizationInfo[];

  // ========== Organization ==========

  /** Hire a role into an organization */
  hire(roleId: string, orgName: string): void;

  /** Fire a role from an organization (auto-dismisses if on_duty) */
  fire(roleId: string, orgName: string): void;

  /** Establish a position within an organization */
  establish(positionName: string, source: string, orgName: string): void;

  /** Appoint a role to a position */
  appoint(roleId: string, positionName: string, orgName: string): void;

  /** Dismiss a role from their position (back to member) */
  dismiss(roleId: string): void;

  /** Get duties for a position */
  positionDuties(positionName: string, orgName: string): Duty[];

  /** Get a role's current assignment */
  getAssignment(roleId: string): Assignment | null;

  /** Get position info */
  getPosition(positionName: string, orgName: string): PositionInfo | null;

  // ========== Role ==========

  /** Load all identity features for a role (includes duties if on_duty) */
  identity(roleId: string): Feature[];

  /** Add a growth dimension to a role's identity */
  growup(
    roleId: string,
    type: "knowledge" | "experience" | "voice",
    name: string,
    source: string
  ): Feature;

  /** Find the current active goal for a role (with plan + tasks context) */
  activeGoal(roleId: string): (Goal & { plan: Plan | null; tasks: Task[] }) | null;

  /** List all active (uncompleted) goals for a role */
  allActiveGoals(roleId: string): Goal[];

  /** Get the currently focused goal name for a role */
  getFocusedGoal(roleId: string): string | null;

  /** Set the focused goal for a role by name */
  setFocusedGoal(roleId: string, name: string): void;

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

  /** Reflect: distill experiences into knowledge, removing the original experiences */
  reflect(
    roleId: string,
    experienceNames: string[],
    knowledgeName: string,
    knowledgeSource: string
  ): Feature;
}
