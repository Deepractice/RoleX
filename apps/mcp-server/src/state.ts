/**
 * McpState — thin session holder for the MCP server.
 *
 * All business logic (state tracking, cognitive hints, encounter/experience
 * registries) now lives in RoleContext (rolexjs). McpState only holds
 * the ctx reference and provides MCP-specific helpers.
 */
import type { RoleContext, Rolex } from "rolexjs";

export class McpState {
  ctx: RoleContext | null = null;

  constructor(readonly rolex: Rolex) {}

  requireCtx(): RoleContext {
    if (!this.ctx) throw new Error("No active role. Call activate first.");
    return this.ctx;
  }

  findIndividual(roleId: string): boolean {
    return this.rolex.find(roleId) !== null;
  }
}
