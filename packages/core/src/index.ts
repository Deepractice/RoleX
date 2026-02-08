/**
 * @rolexjs/core
 *
 * RDD (Role-Driven Development) Five-Dimension Model.
 *
 * Three-entity architecture:
 *   Role         = WHO  (identity, goals)
 *   Organization = WHERE (structure, nesting)
 *   Position     = WHAT  (duties, boundaries)
 *
 * Every role operates through five dimensions:
 *
 *   Identity → Goal → Plan → Task/Skill
 *   (I am)     (I want) (I plan) (I do)
 *
 * Goal, Plan, Task, Duty extend Feature (IS-A).
 * Identity wraps Features (HAS-A).
 * Feature and Scenario extend Gherkin types with RDD semantics.
 * Verification is embedded — Scenario.verifiable determines testability.
 */

// ========== RDD Types (extend Gherkin) ==========

export type { Feature } from "./Feature.js";
export type { Scenario } from "./Scenario.js";

// ========== Core Model ==========

export type { Role } from "./Role.js";
export type { Identity } from "./Identity.js";
export type { Goal } from "./Goal.js";
export type { Plan } from "./Plan.js";
export type { Task } from "./Task.js";
export type { Duty } from "./Duty.js";
export type { Skill } from "./Skill.js";
export type {
  Platform,
  OrganizationInfo,
  OrganizationConfig,
  PositionInfo,
  Assignment,
  RolexConfig,
  RoleEntry,
  Directory,
} from "./Platform.js";

// ========== State Machines ==========

export {
  getRoleState,
  getPositionState,
  ROLE_MACHINE,
  POSITION_MACHINE,
  findTransition,
  canTransition,
  transition,
  RELATIONS,
  validateOneToOne,
} from "./model/index.js";
export type { RoleState, PositionState, Transition, OneToOneConstraint } from "./model/index.js";
