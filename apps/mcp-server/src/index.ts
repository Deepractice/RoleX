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
import { z } from "zod";
import { createRolex, world, WORLD_TOPICS, descriptions } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

// ========== Platform & System ==========

const rootDir = process.env.ROLEX_ROOT || process.cwd();
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

// ========== Tools ==========

// identity
server.addTool({
  name: "identity",
  description: descriptions.identity,
  parameters: z.object({
    roleId: z.string().describe("Role name to activate"),
  }),
  execute: async (args) => rolex.individual.execute("identity", args),
});

// focus
server.addTool({
  name: "focus",
  description: descriptions.focus,
  parameters: z.object({
    name: z.string().optional().describe("Goal name to switch focus to"),
  }),
  execute: async (args) => rolex.individual.execute("focus", args),
});

// want
server.addTool({
  name: "want",
  description: descriptions.want,
  parameters: z.object({
    name: z.string().describe("Goal name"),
    source: z.string().describe("Gherkin goal feature source"),
  }),
  execute: async (args) => rolex.individual.execute("want", args),
});

// design
server.addTool({
  name: "design",
  description: descriptions.design,
  parameters: z.object({
    source: z.string().describe("Gherkin plan feature source"),
  }),
  execute: async (args) => rolex.individual.execute("design", args),
});

// todo
server.addTool({
  name: "todo",
  description: descriptions.todo,
  parameters: z.object({
    name: z.string().describe("Task name"),
    source: z.string().describe("Gherkin task feature source"),
  }),
  execute: async (args) => rolex.individual.execute("todo", args),
});

// finish
server.addTool({
  name: "finish",
  description: descriptions.finish,
  parameters: z.object({
    name: z.string().describe("Task name to finish"),
    experience: experienceParam,
  }),
  execute: async (args) => rolex.individual.execute("finish", args),
});

// achieve
server.addTool({
  name: "achieve",
  description: descriptions.achieve,
  parameters: z.object({
    experience: experienceParam,
  }),
  execute: async (args) => rolex.individual.execute("achieve", args),
});

// abandon
server.addTool({
  name: "abandon",
  description: descriptions.abandon,
  parameters: z.object({
    experience: experienceParam,
  }),
  execute: async (args) => rolex.individual.execute("abandon", args),
});

// synthesize
server.addTool({
  name: "synthesize",
  description: descriptions.synthesize,
  parameters: z.object({
    name: z.string().describe("Experience name"),
    source: z.string().describe("Gherkin experience feature source"),
  }),
  execute: async (args) => rolex.individual.execute("synthesize", args),
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
  execute: async (args) => rolex.individual.execute("reflect", args),
});

// apply
server.addTool({
  name: "apply",
  description: descriptions.apply,
  parameters: z.object({
    name: z.string().describe("Procedure name to apply"),
  }),
  execute: async (args) => rolex.individual.execute("apply", args),
});

// use
server.addTool({
  name: "use",
  description: descriptions.use,
  parameters: z.object({
    locator: z.string().describe("Resource locator (e.g. 'tool-name:1.0.0')"),
    args: z.unknown().optional().describe("Arguments to pass to the tool"),
  }),
  execute: async (args) => rolex.individual.execute("use", args),
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
