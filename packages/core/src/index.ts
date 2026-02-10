/**
 * @rolexjs/core
 *
 * Built on @rolexjs/system.
 *
 * Four systems share one Platform:
 *   - Role System: born, teach, train, retire, kill (external)
 *   - Individual System: identity...apply (first-person)
 *   - Organization System: found, dissolve (external)
 *   - Governance System: rule...directory (internal)
 */

// ========== Platform ==========

export type { Platform } from "./Platform.js";

// ========== Types ==========

export type { Feature } from "./Feature.js";
export type { Scenario } from "./Scenario.js";

// ========== Role System (declarations) ==========

export {
  BORN,
  TEACH,
  TRAIN,
  RETIRE,
  KILL,
  ROLE_LIFECYCLE,
} from "./Role.js";

// ========== Individual System (declarations) ==========

export {
  // Structure
  ROLE,
  // Information
  PERSONA,
  KNOWLEDGE,
  PROCEDURE,
  EXPERIENCE,
  GOAL,
  PLAN,
  TASK,
  // State
  COGNITION,
  INTENTION,
  // Process
  WANT,
  DESIGN,
  TODO,
  FINISH,
  ACHIEVE,
  ABANDON,
  SYNTHESIZE,
  REFLECT,
  IDENTITY,
  FOCUS,
  SKILL,
  USE,
  // System
  GOAL_EXECUTION,
  COGNITIVE_GROWTH,
} from "./individual.js";

// ========== Organization System (declarations) ==========

export {
  // Structure
  ORGANIZATION,
  POSITION,
  // Information
  CHARTER,
  DUTY,
  // Relation
  MEMBERSHIP,
  ASSIGNMENT,
  // Process (external)
  FOUND,
  DISSOLVE,
  // Process (governance)
  RULE,
  ESTABLISH,
  ABOLISH,
  ASSIGN,
  HIRE,
  FIRE,
  APPOINT,
  DISMISS,
  DIRECTORY,
  // System
  ORG_LIFECYCLE,
  GOVERNANCE,
} from "./organization.js";

// ========== i18n ==========

export { t } from "./i18n/index.js";
export type { Locale, MessageKey } from "./i18n/index.js";

// ========== Runnable Systems ==========

export { createRoleSystem } from "./role-system.js";
export { createIndividualSystem } from "./individual-system.js";
export { createOrgSystem } from "./org-system.js";
export { createGovernanceSystem } from "./governance-system.js";
