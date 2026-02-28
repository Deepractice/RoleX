/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Thin wrapper around the Rolex API. All business logic (state tracking,
 * cognitive hints, encounter/experience registries) lives in Role + RoleContext.
 * MCP only translates protocol calls to API calls.
 */

import { localPlatform } from "@rolexjs/local-platform";
import { FastMCP } from "fastmcp";
import { createRoleX, detail } from "rolexjs";

import { z } from "zod";
import { instructions } from "./instructions.js";
import { render } from "./render.js";
import { McpState } from "./state.js";

// ========== Setup ==========

const rolex = createRoleX(
  localPlatform({
    bootstrap: ["npm:@rolexjs/genesis"],
  })
);
await rolex.genesis();
const state = new McpState();

// ========== Server ==========

const server = new FastMCP({
  name: "rolex",
  version: "0.12.0",
  instructions,
});

// ========== Helpers ==========

function fmt(
  process: string,
  label: string,
  result: { state: any; process: string; hint?: string }
) {
  return render({
    process,
    name: label,
    result,
    cognitiveHint: result.hint ?? null,
  });
}

// ========== Tools: Role ==========

server.addTool({
  name: "activate",
  description: detail("activate"),
  parameters: z.object({
    roleId: z.string().describe("Role name to activate"),
  }),
  execute: async ({ roleId }) => {
    try {
      const role = await rolex.activate(roleId);
      state.role = role;
      const result = role.project();
      const focusedGoalId = role.ctx.focusedGoalId;
      return render({
        process: "activate",
        name: roleId,
        result,
        cognitiveHint: result.hint ?? null,
        fold: (node) => node.name === "goal" && node.id !== focusedGoalId,
      });
    } catch {
      const census = await rolex.direct<string>("!census.list");
      throw new Error(
        `"${roleId}" not found. Available:\n\n${census}\n\nTry again with the correct id or alias.`
      );
    }
  },
});

server.addTool({
  name: "focus",
  description: detail("focus"),
  parameters: z.object({
    id: z.string().optional().describe("Goal id to switch to. Omit to view current."),
  }),
  execute: async ({ id }) => {
    const role = state.requireRole();
    const result = role.focus(id);
    return fmt("focus", id ?? "current goal", result);
  },
});

// ========== Tools: Execution ==========

server.addTool({
  name: "want",
  description: detail("want"),
  parameters: z.object({
    id: z.string().describe("Goal id (used for focus/reference)"),
    goal: z.string().describe("Gherkin Feature source describing the goal"),
  }),
  execute: async ({ id, goal }) => {
    const role = state.requireRole();
    const result = role.want(goal, id);
    return fmt("want", id, result);
  },
});

server.addTool({
  name: "plan",
  description: detail("plan"),
  parameters: z.object({
    id: z.string().describe("Plan id — keywords from the plan content joined by hyphens"),
    plan: z.string().describe("Gherkin Feature source describing the plan"),
    after: z
      .string()
      .optional()
      .describe("Plan id this plan follows (sequential/phase relationship)"),
    fallback: z
      .string()
      .optional()
      .describe("Plan id this plan is a backup for (alternative/strategy relationship)"),
  }),
  execute: async ({ id, plan, after, fallback }) => {
    const role = state.requireRole();
    const result = role.plan(plan, id, after, fallback);
    return fmt("plan", id, result);
  },
});

server.addTool({
  name: "todo",
  description: detail("todo"),
  parameters: z.object({
    id: z.string().describe("Task id (used for finish/reference)"),
    task: z.string().describe("Gherkin Feature source describing the task"),
  }),
  execute: async ({ id, task }) => {
    const role = state.requireRole();
    const result = role.todo(task, id);
    return fmt("todo", id, result);
  },
});

server.addTool({
  name: "finish",
  description: detail("finish"),
  parameters: z.object({
    id: z.string().describe("Task id to finish"),
    encounter: z.string().optional().describe("Optional Gherkin Feature describing what happened"),
  }),
  execute: async ({ id, encounter }) => {
    const role = state.requireRole();
    const result = role.finish(id, encounter);
    return fmt("finish", id, result);
  },
});

server.addTool({
  name: "complete",
  description: detail("complete"),
  parameters: z.object({
    id: z.string().optional().describe("Plan id to complete (defaults to focused plan)"),
    encounter: z.string().optional().describe("Optional Gherkin Feature describing what happened"),
  }),
  execute: async ({ id, encounter }) => {
    const role = state.requireRole();
    const result = role.complete(id, encounter);
    return fmt("complete", id ?? "focused plan", result);
  },
});

server.addTool({
  name: "abandon",
  description: detail("abandon"),
  parameters: z.object({
    id: z.string().optional().describe("Plan id to abandon (defaults to focused plan)"),
    encounter: z.string().optional().describe("Optional Gherkin Feature describing what happened"),
  }),
  execute: async ({ id, encounter }) => {
    const role = state.requireRole();
    const result = role.abandon(id, encounter);
    return fmt("abandon", id ?? "focused plan", result);
  },
});

// ========== Tools: Cognition ==========

server.addTool({
  name: "reflect",
  description: detail("reflect"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Encounter ids to reflect on (selective consumption)"),
    id: z
      .string()
      .describe("Experience id — keywords from the experience content joined by hyphens"),
    experience: z.string().optional().describe("Gherkin Feature source for the experience"),
  }),
  execute: async ({ ids, id, experience }) => {
    const role = state.requireRole();
    const result = role.reflect(ids[0] ?? undefined, experience, id);
    return fmt("reflect", id, result);
  },
});

server.addTool({
  name: "realize",
  description: detail("realize"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Experience ids to distill into a principle"),
    id: z.string().describe("Principle id — keywords from the principle content joined by hyphens"),
    principle: z.string().optional().describe("Gherkin Feature source for the principle"),
  }),
  execute: async ({ ids, id, principle }) => {
    const role = state.requireRole();
    const result = role.realize(ids[0] ?? undefined, principle, id);
    return fmt("realize", id, result);
  },
});

server.addTool({
  name: "master",
  description: detail("master"),
  parameters: z.object({
    ids: z.array(z.string()).optional().describe("Experience ids to distill into a procedure"),
    id: z.string().describe("Procedure id — keywords from the procedure content joined by hyphens"),
    procedure: z.string().describe("Gherkin Feature source for the procedure"),
  }),
  execute: async ({ ids, id, procedure }) => {
    const role = state.requireRole();
    const result = role.master(procedure, id, ids?.[0]);
    return fmt("master", id, result);
  },
});

// ========== Tools: Knowledge management ==========

server.addTool({
  name: "forget",
  description: detail("forget"),
  parameters: z.object({
    id: z
      .string()
      .describe("Id of the node to remove (principle, procedure, experience, encounter, etc.)"),
  }),
  execute: async ({ id }) => {
    const role = state.requireRole();
    const result = role.forget(id);
    return fmt("forget", id, result);
  },
});

// ========== Tools: Skill loading ==========

server.addTool({
  name: "skill",
  description: detail("skill"),
  parameters: z.object({
    locator: z
      .string()
      .describe("ResourceX locator for the skill (e.g. deepractice/role-management)"),
  }),
  execute: async ({ locator }) => {
    const role = state.requireRole();
    return role.skill(locator);
  },
});

// ========== Tools: Use ==========

server.addTool({
  name: "use",
  description: detail("use"),
  parameters: z.object({
    locator: z
      .string()
      .describe(
        "Locator string. !namespace.method for RoleX commands, or a ResourceX locator for resources"
      ),
    args: z.record(z.unknown()).optional().describe("Named arguments for the command or resource"),
  }),
  execute: async ({ locator, args }) => {
    const role = state.requireRole();
    const result = await role.use(locator, args);
    if (result == null) return `${locator} done.`;
    if (typeof result === "string") return result;
    return JSON.stringify(result, null, 2);
  },
});

// ========== Tools: Direct ==========

server.addTool({
  name: "direct",
  description: detail("direct"),
  parameters: z.object({
    locator: z
      .string()
      .describe(
        "Locator string. !namespace.method for RoleX commands, or a ResourceX locator for resources"
      ),
    args: z.record(z.unknown()).optional().describe("Named arguments for the command or resource"),
  }),
  execute: async ({ locator, args }) => {
    const result = await rolex.direct(locator, args);
    if (result == null) return `${locator} done.`;
    if (typeof result === "string") return result;
    return JSON.stringify(result, null, 2);
  },
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
