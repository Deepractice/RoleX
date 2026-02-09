/**
 * rolexjs
 * RoleX - AI Agent Role Management Framework
 *
 * Four-entity architecture:
 *   Role         → WHO  (identity, goals)
 *   Organization → WHERE (structure, nesting)
 *   Position     → WHAT  (duties, boundaries)
 *   Skill        → HOW  (pluggable capabilities)
 *
 * Unified API — three namespaces:
 *   society      → Creation & establishment (born, found, establish, teach, createSkill, directory)
 *   organization → Membership management (hire, fire, appoint, dismiss)
 *   role         → First-person lifecycle (identity, focus, want, plan, todo, ...)
 *
 * API Registry — single source of truth:
 *   import { apiRegistry } from "rolexjs";
 *   apiRegistry.society.born      // ApiOperation
 *   apiRegistry.role.identity     // ApiOperation
 *   apiRegistry.allOperations()   // ApiOperation[]
 *
 * Platform-agnostic — import a Platform implementation separately:
 *   @rolexjs/local-platform  → filesystem (.rolex/ directory)
 */

// Core types
export * from "@rolexjs/core";

// Entity classes
export { Rolex } from "./Rolex.js";
export { Organization } from "./Organization.js";
export { Role } from "./Role.js";
export { Position } from "./Position.js";
export { SkillEntity } from "./Skill.js";

// Unified API layer — the authoritative source
export {
  apiRegistry,
  societyOperations,
  organizationOperations,
  roleOperations,
  skillOperations,
} from "./api/index.js";
export type {
  ApiOperation,
  ApiContext,
  ApiNamespace,
  ApiRegistry,
  Permission,
} from "./api/index.js";

// Descriptions (kept for backward compat — canonical source is now API operations)
export * from "./descriptions.js";

// Rendering utilities
export {
  renderFeature,
  renderFeatures,
  renderStatusBar,
  renderError,
  next,
  NEXT,
  nextHire,
  nextFinish,
} from "./render.js";

// Bootstrap
export { bootstrap } from "./bootstrap.js";
