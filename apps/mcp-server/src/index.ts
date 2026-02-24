/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Thin wrapper around the Rolex API. All business logic (state tracking,
 * cognitive hints, encounter/experience registries) lives in RoleContext (rolexjs).
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

const rolex = createRoleX(localPlatform());
const state = new McpState(rolex);

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
    if (!state.findIndividual(roleId)) {
      rolex.individual.born(undefined, roleId);
    }
    const result = await rolex.role.activate(roleId);
    state.ctx = result.ctx!;
    return fmt("activate", roleId, result);
  },
});

server.addTool({
  name: "focus",
  description: detail("focus"),
  parameters: z.object({
    id: z.string().optional().describe("Goal id to switch to. Omit to view current."),
  }),
  execute: async ({ id }) => {
    const ctx = state.requireCtx();
    const goalId = id ?? ctx.requireGoalId();
    const result = rolex.role.focus(goalId, ctx);
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
    const ctx = state.requireCtx();
    const result = rolex.role.want(ctx.roleId, goal, id, undefined, ctx);
    return fmt("want", id, result);
  },
});

server.addTool({
  name: "plan",
  description: detail("plan"),
  parameters: z.object({
    id: z.string().describe("Plan id — keywords from the plan content joined by hyphens"),
    plan: z.string().describe("Gherkin Feature source describing the plan"),
  }),
  execute: async ({ id, plan }) => {
    const ctx = state.requireCtx();
    const goalId = ctx.requireGoalId();
    const result = rolex.role.plan(goalId, plan, id, ctx);
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
    const ctx = state.requireCtx();
    const planId = ctx.requirePlanId();
    const result = rolex.role.todo(planId, task, id, undefined, ctx);
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
    const ctx = state.requireCtx();
    const result = rolex.role.finish(id, ctx.roleId, encounter, ctx);
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
    const ctx = state.requireCtx();
    const planId = id ?? ctx.requirePlanId();
    const result = rolex.role.complete(planId, ctx.roleId, encounter, ctx);
    return fmt("complete", planId, result);
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
    const ctx = state.requireCtx();
    const planId = id ?? ctx.requirePlanId();
    const result = rolex.role.abandon(planId, ctx.roleId, encounter, ctx);
    return fmt("abandon", planId, result);
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
    const ctx = state.requireCtx();
    const result = rolex.role.reflect(ids[0], ctx.roleId, experience, id, ctx);
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
    const ctx = state.requireCtx();
    const result = rolex.role.realize(ids[0], ctx.roleId, principle, id, ctx);
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
    const ctx = state.requireCtx();
    const result = rolex.role.master(ctx.roleId, procedure, id, ids?.[0], ctx);
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
    const ctx = state.requireCtx();
    const result = await rolex.role.forget(id, ctx.roleId);
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
    const content = await rolex.role.skill(locator);
    return content;
  },
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
