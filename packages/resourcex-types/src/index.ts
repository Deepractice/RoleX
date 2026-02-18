/**
 * @rolexjs/resourcex-types — ResourceX type handlers for RoleX.
 *
 * Two types:
 *   role         — individual prototype (individual.json + *.feature → State)
 *   organization — organization prototype (organization.json + *.feature → State)
 *
 * Register with ResourceX:
 *   resourcex.supportType(roleType);
 *   resourcex.supportType(organizationType);
 */

export { roleType } from "./role.js";
export { organizationType } from "./organization.js";
