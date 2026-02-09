/**
 * @rolexjs/mcp-server
 *
 * MCP server for Rolex — Role-Driven Development.
 *
 * This is a thin consumer of the Rolex API registry.
 * All operation definitions (descriptions, parameters, permissions, execute)
 * come from rolexjs — this server only adds:
 * - MCP transport (stdio)
 * - Permission checking (nuwa gate)
 * - Error rendering
 *
 * Usage:
 *   rolex-mcp [.rolex-dir]
 */

import { FastMCP } from "fastmcp";
import { Rolex, INSTRUCTIONS, apiRegistry, renderError, bootstrap } from "rolexjs";
import type { ApiContext, ApiOperation } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_ROLEX_DIR = join(homedir(), ".rolex");
const rolexDir = process.argv[2] || process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
const platform = new LocalPlatform(rolexDir);
bootstrap(platform);
const rolex = new Rolex(platform);

// ========== API Context ==========

const ctx: ApiContext = {
  rolex,
  platform,
  currentRole: null,
  currentRoleName: "",
};

// ========== MCP Server ==========

const server = new FastMCP({
  name: "Rolex MCP Server",
  version: "0.3.0",
  instructions: INSTRUCTIONS,
});

// ========== Permission Check ==========

function checkPermission(op: ApiOperation): string | null {
  if (op.permission === "nuwa") {
    if (!ctx.currentRole || ctx.currentRoleName !== "nuwa") {
      const who = ctx.currentRoleName || "none";
      return `Permission denied. Only nuwa can use this tool. Current role: ${who}`;
    }
  }
  if (op.permission === "role") {
    if (!ctx.currentRole) {
      throw new Error("No active role. Call identity(roleId) first to activate a role.");
    }
  }
  return null;
}

// ========== Register All Operations ==========

for (const op of apiRegistry.allOperations()) {
  server.addTool({
    name: op.name,
    description: op.description,
    parameters: op.parameters,
    execute: async (args: any) => {
      try {
        // Permission gate
        const denied = checkPermission(op);
        if (denied) return denied;

        // Delegate to API operation
        return op.execute(ctx, args);
      } catch (error) {
        throw new Error(renderError(op.name, error));
      }
    },
  });
}

// ========== Start ==========

server.start({
  transportType: "stdio",
});
