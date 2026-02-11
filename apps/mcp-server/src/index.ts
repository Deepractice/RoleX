/**
 * @rolexjs/mcp-server
 *
 * RoleX Individual System MCP server.
 *
 * All tools are auto-derived from system process definitions.
 * Only special behaviors (output wrapping, task name) are configured here.
 */

import { FastMCP } from "fastmcp";
import { createRolex, world, WORLD_TOPICS, wrapOutput } from "rolexjs";
import { LocalPlatform, resolveDir } from "@rolexjs/local-platform";
import { systemToMcp } from "./lib/system-mcp.js";

// ========== Platform & System ==========

const platform = new LocalPlatform(resolveDir());
const rolex = createRolex({ platform });

// ========== Instructions ==========

const instructions = WORLD_TOPICS.map((t) => world[t]).join("\n\n");

// ========== Server ==========

const server = new FastMCP({
  name: "RoleX MCP Server",
  version: "1.0.0",
  instructions,
});

// ========== Helpers ==========

/** Get the active role name from the individual system context. */
function activeRole(): string {
  return rolex.individual.ctx.structure;
}

/** Execute a process and wrap output with status bar + hint. */
async function run(
  processName: string,
  args: unknown,
  extra?: Record<string, any>
): Promise<string> {
  const result = await rolex.individual.execute(processName, args);
  const roleName = activeRole();
  if (!roleName) return result;
  return wrapOutput(rolex.graph, platform, roleName, processName, result, extra);
}

// ========== Tools (auto-derived) ==========

systemToMcp(server, rolex.individual.processes, {
  run,
  overrides: {
    todo: {
      execute: async (args, run) => run("todo", args, { taskName: args.name }),
    },
  },
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
