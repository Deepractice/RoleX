/**
 * rolexjs
 * RoleX - AI Agent Role Management Framework
 *
 * Three-layer API:
 *   Rolex        → Society (born, found, directory, find)
 *   Organization → Org management (hire, fire)
 *   Role         → Embodied perspective (first-person)
 *
 * Platform-agnostic — import a Platform implementation separately:
 *   @rolexjs/local-platform  → filesystem (.rolex/ directory)
 */

export * from "@rolexjs/core";
export { Rolex } from "./Rolex.js";
export { Organization } from "./Organization.js";
export { Role } from "./Role.js";
export * from "./descriptions.js";
export { renderFeature, renderFeatures, renderStatusBar } from "./render.js";
export { bootstrap } from "./bootstrap.js";
