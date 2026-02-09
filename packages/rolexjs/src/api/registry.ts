/**
 * api/registry.ts — The API registry.
 *
 * Single source of truth for all Rolex operations.
 * MCP servers, CLIs, and other clients consume from here.
 */

import type { ApiOperation, ApiRegistry } from "./types.js";
import { societyOperations } from "./society.js";
import { organizationOperations } from "./organization.js";
import { roleOperations } from "./role.js";

/**
 * The Rolex API registry — all operations grouped by namespace.
 *
 * Usage:
 *   import { apiRegistry } from "rolexjs";
 *
 *   // Access by namespace
 *   apiRegistry.society.born
 *   apiRegistry.organization.hire
 *   apiRegistry.role.identity
 *
 *   // Iterate all operations
 *   for (const op of apiRegistry.allOperations()) {
 *     console.log(op.name, op.namespace);
 *   }
 */
export const apiRegistry: ApiRegistry = {
  society: societyOperations,
  organization: organizationOperations,
  role: roleOperations,

  allOperations(): ApiOperation[] {
    return [
      ...Object.values(societyOperations),
      ...Object.values(organizationOperations),
      ...Object.values(roleOperations),
    ];
  },
};
