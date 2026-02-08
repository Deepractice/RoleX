/**
 * @rolexjs/mcp-server
 *
 * MCP server for Rolex — Role-level tools only.
 * Society and Organization operations are handled by the CLI.
 *
 * Usage:
 *   rolex-mcp .rolex
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import {
  Rolex,
  Organization,
  Role,
  LocalPlatform,
  INSTRUCTIONS,
  DESC_GROWUP,
  DESC_IDENTITY,
  DESC_FOCUS,
  DESC_WANT,
  DESC_PLAN,
  DESC_TODO,
  DESC_ACHIEVE,
  DESC_ABANDON,
  DESC_FINISH,
} from "rolexjs";

const rolexDir = process.argv[2] || process.env.ROLEX_DIR || ".rolex";
const rolex = new Rolex(new LocalPlatform(rolexDir));
let currentRole: Role | null = null;

const server = new FastMCP({
  name: "Rolex MCP Server",
  version: "0.1.0",
  instructions: INSTRUCTIONS,
});

// ========== Role Activation ==========

function requireRole(): Role {
  if (!currentRole) {
    throw new Error(
      "No active role. Call identity(roleId) first to activate a role.",
    );
  }
  return currentRole;
}

server.addTool({
  name: "identity",
  description: DESC_IDENTITY,
  parameters: z.object({
    roleId: z
      .string()
      .describe("Role name (e.g. 'alex')"),
  }),
  execute: async ({ roleId }) => {
    const dir = rolex.directory();
    const org = rolex.find(dir.organizations[0].name) as Organization;
    currentRole = org.role(roleId);
    const features = currentRole.identity();
    return JSON.stringify(
      features.map((f) => ({
        name: f.name,
        description: f.description,
        type: f.type,
        scenarios: f.scenarios.map((s) => ({
          name: s.name,
          steps: s.steps.map((st) => `${st.keyword.trim()} ${st.text}`),
          verifiable: s.verifiable,
        })),
      })),
      null,
      2,
    );
  },
});

// ========== Role Tools ==========

server.addTool({
  name: "growup",
  description: DESC_GROWUP,
  parameters: z.object({
    type: z
      .enum(["knowledge", "experience", "voice"])
      .describe("Growth dimension: knowledge (what I know), experience (what I've lived), voice (how I'm perceived)"),
    name: z
      .string()
      .describe("Name for this growth (used as filename, e.g. 'distributed-systems')"),
    source: z
      .string()
      .describe("Gherkin feature source text"),
  }),
  execute: async ({ type, name, source }) => {
    const role = requireRole();
    const feature = role.growup(type, name, source);
    return `Growth added (${type}): ${feature.name}`;
  },
});

server.addTool({
  name: "focus",
  description: DESC_FOCUS,
  parameters: z.object({}),
  execute: async () => {
    const role = requireRole();
    const goal = role.focus();
    if (!goal) return "No active goal. Use want() to set a new goal.";

    return JSON.stringify(
      {
        name: goal.name,
        description: goal.description,
        type: goal.type,
        scenarios: goal.scenarios.map((s) => ({
          name: s.name,
          steps: s.steps.map((st) => `${st.keyword.trim()} ${st.text}`),
          verifiable: s.verifiable,
        })),
        plan: goal.plan
          ? {
              name: goal.plan.name,
              scenarios: goal.plan.scenarios.map((s) => ({
                name: s.name,
                steps: s.steps.map((st) => `${st.keyword.trim()} ${st.text}`),
              })),
            }
          : null,
        tasks: goal.tasks.map((t) => ({
          name: t.name,
          scenarios: t.scenarios.map((s) => ({
            name: s.name,
            verifiable: s.verifiable,
          })),
          tags: t.tags.map((tag) => tag.name),
        })),
      },
      null,
      2,
    );
  },
});

server.addTool({
  name: "want",
  description: DESC_WANT,
  parameters: z.object({
    name: z
      .string()
      .describe("Goal name (used as directory name, e.g. 'local-platform')"),
    source: z
      .string()
      .describe("Gherkin feature source text for the goal"),
    testable: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this goal's scenarios should become persistent automated verification"),
  }),
  execute: async ({ name, source, testable }) => {
    const role = requireRole();
    const goal = role.want(name, source, testable);
    return `Goal created: ${goal.name}`;
  },
});

server.addTool({
  name: "plan",
  description: DESC_PLAN,
  parameters: z.object({
    source: z
      .string()
      .describe("Gherkin feature source text for the plan"),
  }),
  execute: async ({ source }) => {
    const role = requireRole();
    const p = role.plan(source);
    return `Plan created: ${p.name}`;
  },
});

server.addTool({
  name: "todo",
  description: DESC_TODO,
  parameters: z.object({
    name: z
      .string()
      .describe("Task name (used as filename, e.g. 'implement-loader')"),
    source: z
      .string()
      .describe("Gherkin feature source text for the task"),
    testable: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this task's scenarios should become unit or integration tests"),
  }),
  execute: async ({ name, source, testable }) => {
    const role = requireRole();
    const task = role.todo(name, source, testable);
    return `Task created: ${task.name}`;
  },
});

server.addTool({
  name: "achieve",
  description: DESC_ACHIEVE,
  parameters: z.object({
    experience: z
      .string()
      .optional()
      .describe("Optional Gherkin feature source capturing what was learned — auto-saved as experience growup"),
  }),
  execute: async ({ experience }) => {
    const role = requireRole();
    role.achieve(experience);
    return experience ? "Goal achieved. Experience captured." : "Goal achieved.";
  },
});

server.addTool({
  name: "abandon",
  description: DESC_ABANDON,
  parameters: z.object({
    experience: z
      .string()
      .optional()
      .describe("Optional Gherkin feature source capturing what was learned — auto-saved as experience growup"),
  }),
  execute: async ({ experience }) => {
    const role = requireRole();
    role.abandon(experience);
    return experience ? "Goal abandoned. Experience captured." : "Goal abandoned.";
  },
});

server.addTool({
  name: "finish",
  description: DESC_FINISH,
  parameters: z.object({
    name: z.string().describe("Task name to mark as done"),
  }),
  execute: async ({ name }) => {
    const role = requireRole();
    role.finish(name);
    return `Task finished: ${name}`;
  },
});

server.start({
  transportType: "stdio",
});
