/**
 * McpState — thin session holder for the MCP server.
 *
 * Holds the active Role handle. All business logic (state tracking,
 * cognitive hints, encounter/experience registries) lives in Role + RoleContext.
 */
import type { Role } from "rolexjs";

export class McpState {
  role: Role | null = null;

  requireRole(): Role {
    if (!this.role) throw new Error("No active role. Call activate first.");
    return this.role;
  }
}
