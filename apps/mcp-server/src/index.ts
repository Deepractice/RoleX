/**
 * @rolexjs/mcp-server
 *
 * RoleX Individual System MCP server.
 *
 * 12 tools — one per Individual System process:
 *   identity, focus, want, design, todo,
 *   finish, achieve, abandon, synthesize, reflect, apply, use
 *
 * Management operations (born, found, hire, etc.) are exposed via skills,
 * not MCP tools. The AI operates AS the role, not ON the role.
 */

import { FastMCP } from "fastmcp";
import { join } from "node:path";
import { homedir } from "node:os";
import { z } from "zod";
import { createRolex, world, WORLD_TOPICS, descriptions, wrapOutput } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

// ========== Platform & System ==========

const rootDir = process.env.ROLEX_ROOT || join(homedir(), ".deepractice", "rolex");
const platform = new LocalPlatform(rootDir);
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

const experienceParam = z.object({
  name: z.string().describe("Experience name"),
  source: z.string().describe("Gherkin feature source for the experience"),
}).optional().describe("Optional experience to synthesize on completion");

/** Get the active role name from the individual system context. */
function activeRole(): string {
  return rolex.individual.ctx.structure;
}

/** Execute a process and wrap output with status bar + hint. */
async function run(processName: string, args: unknown, extra?: { taskName?: string }): Promise<string> {
  const result = await rolex.individual.execute(processName, args);
  const roleName = activeRole();
  if (!roleName) return result;
  return wrapOutput(platform, roleName, processName, result, extra);
}

// ========== Tools ==========

// identity
server.addTool({
  name: "identity",
  description: descriptions.identity,
  parameters: z.object({
    roleId: z.string().describe("Role name to activate"),
  }),
  execute: async (args) => run("identity", args),
});

// focus
server.addTool({
  name: "focus",
  description: descriptions.focus,
  parameters: z.object({
    name: z.string().optional().describe("Goal name to switch focus to"),
  }),
  execute: async (args) => run("focus", args),
});

// want
server.addTool({
  name: "want",
  description: descriptions.want,
  parameters: z.object({
    name: z.string().describe("Goal name"),
    source: z.string().describe("Gherkin goal feature source"),
  }),
  execute: async (args) => run("want", args),
});

// design
server.addTool({
  name: "design",
  description: descriptions.design,
  parameters: z.object({
    source: z.string().describe("Gherkin plan feature source"),
  }),
  execute: async (args) => run("design", args),
});

// todo
server.addTool({
  name: "todo",
  description: descriptions.todo,
  parameters: z.object({
    name: z.string().describe("Task name"),
    source: z.string().describe("Gherkin task feature source"),
  }),
  execute: async (args) => run("todo", args, { taskName: args.name }),
});

// finish
server.addTool({
  name: "finish",
  description: descriptions.finish,
  parameters: z.object({
    name: z.string().describe("Task name to finish"),
    experience: experienceParam,
  }),
  execute: async (args) => run("finish", args),
});

// achieve
server.addTool({
  name: "achieve",
  description: descriptions.achieve,
  parameters: z.object({
    experience: experienceParam,
  }),
  execute: async (args) => run("achieve", args),
});

// abandon
server.addTool({
  name: "abandon",
  description: descriptions.abandon,
  parameters: z.object({
    experience: experienceParam,
  }),
  execute: async (args) => run("abandon", args),
});

// synthesize
server.addTool({
  name: "synthesize",
  description: descriptions.synthesize,
  parameters: z.object({
    name: z.string().describe("Experience name"),
    source: z.string().describe("Gherkin experience feature source"),
  }),
  execute: async (args) => run("synthesize", args),
});

// reflect
server.addTool({
  name: "reflect",
  description: descriptions.reflect,
  parameters: z.object({
    experienceNames: z.array(z.string()).describe("Experience names to consume"),
    knowledgeName: z.string().describe("Knowledge name to produce"),
    knowledgeSource: z.string().describe("Gherkin knowledge feature source"),
  }),
  execute: async (args) => run("reflect", args),
});

// apply
server.addTool({
  name: "apply",
  description: descriptions.apply,
  parameters: z.object({
    name: z.string().describe("Procedure name to apply"),
  }),
  execute: async (args) => run("apply", args),
});

// use
server.addTool({
  name: "use",
  description: descriptions.use,
  parameters: z.object({
    locator: z.string().describe("Resource locator (e.g. 'tool-name:1.0.0')"),
    args: z.unknown().optional().describe("Arguments to pass to the tool"),
  }),
  execute: async (args) => run("use", args),
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
