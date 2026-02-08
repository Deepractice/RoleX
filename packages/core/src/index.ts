/**
 * @rolexjs/core
 *
 * RDD (Role-Driven Development) Five-Dimension Model.
 *
 * Every role operates through five dimensions:
 *
 *   Identity → Goal → Plan → Task/Skill
 *   (I am)     (I want) (I plan) (I do)
 *
 * Goal, Plan, Task extend Feature (IS-A).
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
export type { Skill } from "./Skill.js";
export type {
  Platform,
  Organization,
  OrganizationConfig,
  RolexConfig,
  RoleEntry,
  Directory,
} from "./Platform.js";
