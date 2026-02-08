/**
 * @rolexjs/mcp-server
 *
 * MCP server for Rolex — Role-Driven Development.
 *
 * Tools:
 *   society      — Admin: born, found, directory, find, teach
 *   organization — Admin: hire, fire
 *   identity     — Activate a role
 *   growup/focus/want/plan/todo/achieve/abandon/finish — Role lifecycle
 *
 * Usage:
 *   rolex-mcp [.rolex-dir]
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import {
  Rolex,
  Organization,
  Role,
  INSTRUCTIONS,
  DESC_SOCIETY,
  DESC_ORGANIZATION,
  DESC_GROWUP,
  DESC_IDENTITY,
  DESC_FOCUS,
  DESC_WANT,
  DESC_PLAN,
  DESC_TODO,
  DESC_ACHIEVE,
  DESC_ABANDON,
  DESC_FINISH,
  renderFeatures,
  renderFeature,
  bootstrap,
} from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_ROLEX_DIR = join(homedir(), ".rolex");
const rolexDir = process.argv[2] || process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
const platform = new LocalPlatform(rolexDir);
bootstrap(platform);
const rolex = new Rolex(platform);
let currentRole: Role | null = null;

const server = new FastMCP({
  name: "Rolex MCP Server",
  version: "0.1.0",
  instructions: INSTRUCTIONS,
});

// ========== Helpers ==========

function requireRole(): Role {
  if (!currentRole) {
    throw new Error("No active role. Call identity(roleId) first to activate a role.");
  }
  return currentRole;
}

// ========== Society (folded) ==========

server.addTool({
  name: "society",
  description: DESC_SOCIETY,
  parameters: z.object({
    operation: z
      .enum(["born", "found", "directory", "find", "teach"])
      .describe("The society operation to perform"),
    name: z
      .string()
      .optional()
      .describe("Role name (born/find/teach) or organization name (found)"),
    source: z
      .string()
      .optional()
      .describe("Gherkin feature source (born: persona, teach: knowledge)"),
    roleId: z.string().optional().describe("Target role name for teach operation"),
    type: z
      .enum(["knowledge", "experience", "voice"])
      .optional()
      .describe("Growth dimension for teach operation"),
    dimensionName: z
      .string()
      .optional()
      .describe("Name for the knowledge being taught (e.g. 'distributed-systems')"),
  }),
  execute: async ({ operation, name, source, roleId, type, dimensionName }) => {
    switch (operation) {
      case "born": {
        if (!name || !source) throw new Error("born requires: name, source");
        const feature = rolex.born(name, source);
        return `Role born: ${feature.name}`;
      }
      case "found": {
        if (!name) throw new Error("found requires: name");
        rolex.found(name);
        return `Organization founded: ${name}`;
      }
      case "directory": {
        const dir = rolex.directory();
        const lines: string[] = [];
        for (const entry of dir.organizations) {
          const orgInstance = rolex.find(entry.name) as Organization;
          const info = orgInstance.info();
          lines.push(`Organization: ${info.name}`);
          for (const role of info.roles) {
            lines.push(`  - ${role.name} (team: ${role.team})`);
          }
        }
        return lines.join("\n") || "No organizations found.";
      }
      case "find": {
        if (!name) throw new Error("find requires: name");
        const result = rolex.find(name);
        if (result instanceof Organization) {
          const info = result.info();
          return `Organization: ${info.name} (${info.roles.length} roles)`;
        }
        const features = (result as Role).identity();
        return renderFeatures(features);
      }
      case "teach": {
        if (!roleId || !type || !dimensionName || !source)
          throw new Error("teach requires: roleId, type, dimensionName, source");
        const feature = rolex.teach(roleId, type, dimensionName, source);
        return `Taught ${type}: ${feature.name}`;
      }
      default:
        throw new Error(`Unknown society operation: ${operation}`);
    }
  },
});

// ========== Organization (folded) ==========

server.addTool({
  name: "organization",
  description: DESC_ORGANIZATION,
  parameters: z.object({
    operation: z.enum(["hire", "fire"]).describe("The organization operation to perform"),
    name: z.string().describe("Role name to hire or fire"),
  }),
  execute: async ({ operation, name }) => {
    const dir = rolex.directory();
    const org = rolex.find(dir.organizations[0].name) as Organization;

    switch (operation) {
      case "hire": {
        org.hire(name);
        return `Role hired: ${name}`;
      }
      case "fire": {
        org.fire(name);
        return `Role fired: ${name}`;
      }
      default:
        throw new Error(`Unknown organization operation: ${operation}`);
    }
  },
});

// ========== Role Activation ==========

server.addTool({
  name: "identity",
  description: DESC_IDENTITY,
  parameters: z.object({
    roleId: z.string().describe("Role name (e.g. 'sean')"),
  }),
  execute: async ({ roleId }) => {
    currentRole = rolex.role(roleId);
    const features = currentRole.identity();
    return renderFeatures(features);
  },
});

// ========== Role Tools ==========

server.addTool({
  name: "growup",
  description: DESC_GROWUP,
  parameters: z.object({
    type: z
      .enum(["knowledge", "experience", "voice"])
      .describe(
        "Growth dimension: knowledge (what I know), experience (what I've lived), voice (how I'm perceived)"
      ),
    name: z
      .string()
      .describe("Name for this growth (used as filename, e.g. 'distributed-systems')"),
    source: z.string().describe("Gherkin feature source text"),
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
  parameters: z.object({
    name: z.string().optional().describe("Optional goal name to switch focus to"),
  }),
  execute: async ({ name }) => {
    const role = requireRole();
    const { current, otherGoals } = role.focus(name);
    if (!current && otherGoals.length === 0) return "No active goal. Use want() to set a new goal.";

    const parts: string[] = [];

    if (current) {
      parts.push(renderFeature(current));
      if (current.plan) {
        parts.push(renderFeature(current.plan));
      }
      for (const task of current.tasks) {
        parts.push(renderFeature(task));
      }
    }

    if (otherGoals.length > 0) {
      parts.push("Other active goals:");
      for (const g of otherGoals) {
        parts.push(`  - ${g.name}`);
      }
    }

    return parts.join("\n\n");
  },
});

server.addTool({
  name: "want",
  description: DESC_WANT,
  parameters: z.object({
    name: z.string().describe("Goal name (used as directory name, e.g. 'local-platform')"),
    source: z.string().describe("Gherkin feature source text for the goal"),
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
    source: z.string().describe("Gherkin feature source text for the plan"),
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
    name: z.string().describe("Task name (used as filename, e.g. 'implement-loader')"),
    source: z.string().describe("Gherkin feature source text for the task"),
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
      .describe(
        "Optional Gherkin feature source capturing what was learned — auto-saved as experience growup"
      ),
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
      .describe(
        "Optional Gherkin feature source capturing what was learned — auto-saved as experience growup"
      ),
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
