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
  DESC_REFLECT,
  DESC_FINISH,
  renderFeatures,
  renderFeature,
  renderStatusBar,
  renderError,
  next,
  NEXT,
  nextHire,
  nextFinish,
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

// Auto-activate waiter as default role
let currentRole: Role | null = rolex.role("waiter");
let currentRoleName: string = "waiter";

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

/**
 * Wrap a tool execute function with unified error handling.
 * Catches errors and renders them as formatted markdown.
 */
function safeTool<T>(
  toolName: string,
  fn: (args: T) => Promise<string>
): (args: T) => Promise<string> {
  return async (args: T) => {
    try {
      return await fn(args);
    } catch (error) {
      throw new Error(renderError(toolName, error));
    }
  };
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
  execute: safeTool("society", async ({ operation, name, source, roleId, type, dimensionName }) => {
    switch (operation) {
      case "born": {
        if (!name || !source) throw new Error("born requires: name, source");
        const feature = rolex.born(name, source);
        return next(`Role born: ${feature.name}`, NEXT.born);
      }
      case "found": {
        if (!name) throw new Error("found requires: name");
        rolex.found(name);
        return next(`Organization founded: ${name}`, NEXT.found);
      }
      case "directory": {
        const dir = rolex.directory();
        const lines: string[] = [];

        // Organizations and their hired roles
        if (dir.organizations.length > 0) {
          for (const entry of dir.organizations) {
            const orgInstance = rolex.find(entry.name) as Organization;
            const info = orgInstance.info();
            lines.push(`Organization: ${info.name}`);
            for (const role of info.roles) {
              lines.push(`  - ${role.name} (team: ${role.team})`);
            }
          }
        }

        // Unaffiliated roles (born but not hired)
        const unaffiliated = dir.roles.filter((r) => !r.team);
        if (unaffiliated.length > 0) {
          if (lines.length > 0) lines.push("");
          lines.push("Roles:");
          for (const role of unaffiliated) {
            lines.push(`  - ${role.name}`);
          }
        }

        return lines.join("\n") || "No roles or organizations found.";
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
        return next(`Taught ${type}: ${feature.name}`, NEXT.teach);
      }
      default:
        throw new Error(`Unknown society operation: ${operation}`);
    }
  }),
});

// ========== Organization (folded) ==========

server.addTool({
  name: "organization",
  description: DESC_ORGANIZATION,
  parameters: z.object({
    operation: z.enum(["hire", "fire"]).describe("The organization operation to perform"),
    name: z.string().describe("Role name to hire or fire"),
  }),
  execute: safeTool("organization", async ({ operation, name }) => {
    const dir = rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found. Call found() first.");
    }
    const org = rolex.find(dir.organizations[0].name) as Organization;

    switch (operation) {
      case "hire": {
        org.hire(name);
        return next(`Role hired: ${name}`, nextHire(name));
      }
      case "fire": {
        org.fire(name);
        return next(`Role fired: ${name}`, NEXT.fire);
      }
      default:
        throw new Error(`Unknown organization operation: ${operation}`);
    }
  }),
});

// ========== Role Activation ==========

server.addTool({
  name: "identity",
  description: DESC_IDENTITY,
  parameters: z.object({
    roleId: z.string().describe("Role name (e.g. 'sean')"),
  }),
  execute: safeTool("identity", async ({ roleId }) => {
    currentRole = rolex.role(roleId);
    currentRoleName = roleId;
    const features = currentRole.identity();
    const { current } = currentRole.focus();
    const statusBar = renderStatusBar(roleId, current);
    return `${statusBar}\n\n${renderFeatures(features)}`;
  }),
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
  execute: safeTool("growup", async ({ type, name, source }) => {
    const role = requireRole();
    const feature = role.growup(type, name, source);
    return next(`Growth added (${type}): ${feature.name}`, NEXT.growup);
  }),
});

server.addTool({
  name: "focus",
  description: DESC_FOCUS,
  parameters: z.object({
    name: z.string().optional().describe("Optional goal name to switch focus to"),
  }),
  execute: safeTool("focus", async ({ name }) => {
    const role = requireRole();
    const { current, otherGoals } = role.focus(name);

    const statusBar = renderStatusBar(currentRoleName, current);

    if (!current && otherGoals.length === 0)
      return `${statusBar}\n\nNo active goal. Use want() to set a new goal.`;

    const parts: string[] = [statusBar];

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
  }),
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
  execute: safeTool("want", async ({ name, source, testable }) => {
    const role = requireRole();
    const goal = role.want(name, source, testable);
    return next(`Goal created: ${goal.name}`, NEXT.want);
  }),
});

server.addTool({
  name: "plan",
  description: DESC_PLAN,
  parameters: z.object({
    source: z.string().describe("Gherkin feature source text for the plan"),
  }),
  execute: safeTool("plan", async ({ source }) => {
    const role = requireRole();
    const p = role.plan(source);
    return next(`Plan created: ${p.name}`, NEXT.plan);
  }),
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
  execute: safeTool("todo", async ({ name, source, testable }) => {
    const role = requireRole();
    const task = role.todo(name, source, testable);
    return next(`Task created: ${task.name}`, NEXT.todo);
  }),
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
  execute: safeTool("achieve", async ({ experience }) => {
    const role = requireRole();
    role.achieve(experience);
    const msg = experience ? "Goal achieved. Experience captured." : "Goal achieved.";
    return next(msg, NEXT.achieve);
  }),
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
  execute: safeTool("abandon", async ({ experience }) => {
    const role = requireRole();
    role.abandon(experience);
    const msg = experience ? "Goal abandoned. Experience captured." : "Goal abandoned.";
    return next(msg, NEXT.abandon);
  }),
});

server.addTool({
  name: "reflect",
  description: DESC_REFLECT,
  parameters: z.object({
    experienceNames: z
      .array(z.string())
      .describe(
        "Names of experience files to distill (without .experience.identity.feature suffix)"
      ),
    knowledgeName: z
      .string()
      .describe(
        "Name for the resulting knowledge (used as filename, e.g. 'authentication-principles')"
      ),
    knowledgeSource: z.string().describe("Gherkin feature source text for the knowledge"),
  }),
  execute: safeTool("reflect", async ({ experienceNames, knowledgeName, knowledgeSource }) => {
    const role = requireRole();
    const feature = role.reflect(experienceNames, knowledgeName, knowledgeSource);
    return next(
      `Reflected: ${experienceNames.length} experience(s) → knowledge "${feature.name}"`,
      NEXT.reflect
    );
  }),
});

server.addTool({
  name: "finish",
  description: DESC_FINISH,
  parameters: z.object({
    name: z.string().describe("Task name to mark as done"),
  }),
  execute: safeTool("finish", async ({ name }) => {
    const role = requireRole();
    role.finish(name);

    // Dynamic hint: check remaining tasks
    const { current } = role.focus();
    const remaining = current
      ? current.tasks.filter((t) => !t.tags?.some((tag) => tag.name === "@done")).length
      : -1;
    return next(`Task finished: ${name}`, remaining >= 0 ? nextFinish(remaining) : NEXT.achieve);
  }),
});

server.start({
  transportType: "stdio",
});
