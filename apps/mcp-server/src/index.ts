/**
 * @rolexjs/mcp-server
 *
 * MCP server for Rolex — Role-Driven Development.
 *
 * Three-entity architecture:
 *   Role         = WHO  (identity, goals)
 *   Organization = WHERE (structure, nesting)
 *   Position     = WHAT  (duties, boundaries)
 *
 * Tools:
 *   society      — Admin: born, found, establish, teach
 *   organization — Admin: hire, fire, appoint, dismiss
 *   directory    — Lookup: list all / find by name (all roles)
 *   identity     — Activate a role
 *   synthesize/focus/want/plan/todo/achieve/abandon/finish — Role lifecycle
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
  Position,
  INSTRUCTIONS,
  DESC_SOCIETY,
  DESC_DIRECTORY,
  DESC_ORGANIZATION,
  DESC_SYNTHESIZE,
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

let currentRole: Role | null = null;
let currentRoleName: string = "";

const server = new FastMCP({
  name: "Rolex MCP Server",
  version: "0.2.0",
  instructions: INSTRUCTIONS,
});

// ========== Helpers ==========

function requireRole(): Role {
  if (!currentRole) {
    throw new Error("No active role. Call identity(roleId) first to activate a role.");
  }
  return currentRole;
}

function requireNuwa(): string | null {
  if (!currentRole || currentRoleName !== "nuwa") {
    const who = currentRoleName || "none";
    return `Permission denied. Only nuwa can use this tool. Current role: ${who}`;
  }
  return null;
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
      .enum(["born", "found", "establish", "teach"])
      .describe("The society operation to perform"),
    name: z
      .string()
      .optional()
      .describe("Role name (born/teach), organization name (found), or position name (establish)"),
    source: z
      .string()
      .optional()
      .describe(
        "Gherkin feature source (born: persona, teach: knowledge, found: org description, establish: position duties)"
      ),
    parent: z.string().optional().describe("Parent organization name (for found with nesting)"),
    orgName: z.string().optional().describe("Organization name (for establish)"),
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
  execute: safeTool(
    "society",
    async ({ operation, name, source, parent, orgName, roleId, type, dimensionName }) => {
      const denied = requireNuwa();
      if (denied) return denied;
      switch (operation) {
        case "born": {
          if (!name || !source) throw new Error("born requires: name, source");
          const feature = rolex.born(name, source);
          return next(`Role born: ${feature.name}`, NEXT.born);
        }
        case "found": {
          if (!name) throw new Error("found requires: name");
          rolex.found(name, source, parent);
          return next(`Organization founded: ${name}`, NEXT.found);
        }
        case "establish": {
          if (!name || !source || !orgName)
            throw new Error("establish requires: name, source, orgName");
          rolex.establish(name, source, orgName);
          return next(`Position established: ${name} in ${orgName}`, NEXT.establish);
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
    }
  ),
});

// ========== Directory (all roles) ==========

server.addTool({
  name: "directory",
  description: DESC_DIRECTORY,
  parameters: z.object({
    name: z
      .string()
      .optional()
      .describe("Role, organization, or position name to look up. If omitted, lists everything."),
  }),
  execute: safeTool("directory", async ({ name }) => {
    if (name) {
      const result = rolex.find(name);
      if (result instanceof Organization) {
        const info = result.info();
        const parentStr = info.parent ? ` (parent: ${info.parent})` : "";
        return `Organization: ${info.name}${parentStr}\nMembers: ${info.members.length}\nPositions: ${info.positions.join(", ") || "none"}`;
      }
      if (result instanceof Position) {
        const info = result.info();
        return `Position: ${info.name} in ${info.org}\nState: ${info.state}\nAssigned: ${info.assignedRole || "none"}\nDuties: ${info.duties.length}`;
      }
      const features = (result as Role).identity();
      return renderFeatures(features);
    }

    const dir = rolex.directory();
    const lines: string[] = [];

    if (dir.organizations.length > 0) {
      for (const org of dir.organizations) {
        const parentStr = org.parent ? ` (parent: ${org.parent})` : "";
        lines.push(`Organization: ${org.name}${parentStr}`);

        if (org.positions.length > 0) {
          lines.push("  Positions:");
          for (const pos of org.positions) {
            const posInfo = platform.getPosition(pos, org.name);
            const holder = posInfo?.assignedRole ? ` ← ${posInfo.assignedRole}` : " (vacant)";
            lines.push(`    - ${pos}${holder}`);
          }
        }

        if (org.members.length > 0) {
          lines.push("  Members:");
          for (const member of org.members) {
            const role = dir.roles.find((r) => r.name === member);
            const state = role ? ` [${role.state}]` : "";
            const pos = role?.position ? ` → ${role.position}` : "";
            lines.push(`    - ${member}${state}${pos}`);
          }
        }
      }
    }

    const freeRoles = dir.roles.filter((r) => r.state === "free");
    if (freeRoles.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("Free Roles:");
      for (const role of freeRoles) {
        lines.push(`  - ${role.name}`);
      }
    }

    return lines.join("\n") || "No roles or organizations found.";
  }),
});

// ========== Organization (folded) ==========

server.addTool({
  name: "organization",
  description: DESC_ORGANIZATION,
  parameters: z.object({
    operation: z
      .enum(["hire", "fire", "appoint", "dismiss"])
      .describe("The organization operation to perform"),
    name: z.string().describe("Role name to hire, fire, appoint, or dismiss"),
    position: z.string().optional().describe("Position name (for appoint)"),
    orgName: z
      .string()
      .optional()
      .describe("Target organization name (for hire, required when multiple organizations exist)"),
  }),
  execute: safeTool("organization", async ({ operation, name, position, orgName: targetOrg }) => {
    const denied = requireNuwa();
    if (denied) return denied;
    // Find the first org, or the org the role belongs to
    const dir = rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found. Call found() first.");
    }

    // Resolve target organization
    let orgName: string;
    if (operation === "hire") {
      if (targetOrg) {
        orgName = targetOrg;
      } else if (dir.organizations.length === 1) {
        orgName = dir.organizations[0].name;
      } else {
        const orgNames = dir.organizations.map((o) => o.name).join(", ");
        throw new Error(
          `Multiple organizations exist (${orgNames}). Specify orgName to indicate which one.`
        );
      }
    } else {
      const assignment = platform.getAssignment(name);
      orgName = assignment?.org ?? dir.organizations[0].name;
    }

    const org = rolex.find(orgName) as Organization;

    switch (operation) {
      case "hire": {
        org.hire(name);
        return next(`Role hired: ${name} → ${orgName}`, nextHire(name));
      }
      case "fire": {
        org.fire(name);
        return next(`Role fired: ${name}`, NEXT.fire);
      }
      case "appoint": {
        if (!position) throw new Error("appoint requires: name, position");
        org.appoint(name, position);
        return next(`Role appointed: ${name} → ${position}`, NEXT.appoint);
      }
      case "dismiss": {
        org.dismiss(name);
        return next(`Role dismissed: ${name}`, NEXT.dismiss);
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
    const assignment = platform.getAssignment(roleId);
    const statusBar = renderStatusBar(roleId, current, assignment?.org, assignment?.position);
    return `${statusBar}\n\n${renderFeatures(features)}`;
  }),
});

// ========== Role Tools ==========

server.addTool({
  name: "synthesize",
  description: DESC_SYNTHESIZE,
  parameters: z.object({
    name: z
      .string()
      .describe("Name for this experience (used as filename, e.g. 'auth-system-lessons')"),
    source: z.string().describe("Gherkin feature source text"),
  }),
  execute: safeTool("synthesize", async ({ name, source }) => {
    const role = requireRole();
    const feature = role.synthesize(name, source);
    return next(`Experience synthesized: ${feature.name}`, NEXT.synthesize);
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

    const assignment = platform.getAssignment(currentRoleName);
    const statusBar = renderStatusBar(
      currentRoleName,
      current,
      assignment?.org,
      assignment?.position
    );

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
        "Optional Gherkin feature source capturing what was learned — auto-saved as experience synthesis"
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
        "Optional Gherkin feature source capturing what was learned — auto-saved as experience synthesis"
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
    experience: z
      .string()
      .optional()
      .describe(
        "Optional Gherkin feature source capturing what was learned — auto-saved as experience synthesis"
      ),
  }),
  execute: safeTool("finish", async ({ name, experience }) => {
    const role = requireRole();
    role.finish(name, experience);

    // Dynamic hint: check remaining tasks
    const { current } = role.focus();
    const remaining = current
      ? current.tasks.filter((t) => !t.tags?.some((tag) => tag.name === "@done")).length
      : -1;
    const msg = experience
      ? `Task finished: ${name}. Experience captured.`
      : `Task finished: ${name}`;
    return next(msg, remaining >= 0 ? nextFinish(remaining) : NEXT.achieve);
  }),
});

server.start({
  transportType: "stdio",
});
