/**
 * rolexjs
 * RoleX - AI Agent Role Management Framework
 *
 * Three-layer API:
 *   Rolex        → Society (born, found, directory, find)
 *   Organization → Org management (hire, fire, teach)
 *   Role         → Embodied perspective (first-person)
 */

export * from "@rolexjs/core";
export { Rolex } from "./Rolex.js";
export { Organization } from "./Organization.js";
export { Role } from "./Role.js";
export { LocalPlatform } from "./LocalPlatform.js";
export * from "./descriptions.js";
