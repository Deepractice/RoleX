/**
 * Schema Types
 * @rolexjs/core
 */

import type { Schema } from "dpml";

/**
 * RoleX schema collection
 */
export interface RoleSchemas {
  readonly role: Schema;
  readonly thought: Schema;
  readonly execution: Schema;
  readonly knowledge: Schema;
}
