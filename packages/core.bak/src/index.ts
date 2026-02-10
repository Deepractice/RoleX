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
  SkillInfo,
  Assignment,
  RolexConfig,
  RoleEntry,
  Directory,
} from "./Platform.js";

// ========== Systems Theory (from @rolexjs/model) ==========

export {
  ROLE,
  ORGANIZATION,
  POSITION,
  STRUCTURES,
} from "./structure.js";

export {
  PERSONA,
  KNOWLEDGE,
  EXPERIENCE,
  VOICE,
  CHARTER,
  DUTY,
  GOAL,
  PLAN,
  TASK,
  SKILL,
  INFORMATION_TYPES,
} from "./information.js";

export {
  BORN,
  FOUND,
  ESTABLISH,
  TEACH,
  WANT,
  DESIGN,
  TODO,
  FINISH,
  ACHIEVE,
  ABANDON,
  SYNTHESIZE,
  REFLECT,
  HIRE,
  FIRE,
  APPOINT,
  DISMISS,
  EQUIP,
  UNEQUIP,
  IDENTITY,
  FOCUS,
  DIRECTORY,
  PROCESSES,
} from "./process.js";

export {
  MEMBERSHIP,
  ASSIGNMENT,
  EQUIPMENT,
  RELATION_TYPES,
} from "./relation.js";

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
