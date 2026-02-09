/**
 * rolexjs
 * RoleX - AI Agent Role Management Framework
 *
 * Three-entity architecture:
 *   Role         → WHO  (identity, goals)
 *   Organization → WHERE (structure, nesting)
 *   Position     → WHAT  (duties, boundaries)
 *
 * Three-layer API:
 *   Rolex        → Society (born, found, establish, directory, find)
 *   Organization → Org management (hire, fire, appoint, dismiss)
 *   Role         → Embodied perspective (first-person)
 *
 * Platform-agnostic — import a Platform implementation separately:
 *   @rolexjs/local-platform  → filesystem (.rolex/ directory)
 */

export * from "@rolexjs/core";
export { Rolex } from "./Rolex.js";
export { Organization } from "./Organization.js";
export { Role } from "./Role.js";
export { Position } from "./Position.js";
export { SkillEntity } from "./Skill.js";
export * from "./descriptions.js";
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
export { bootstrap } from "./bootstrap.js";
