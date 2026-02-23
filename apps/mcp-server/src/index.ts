/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Thin wrapper around the Rolex API (which accepts string ids).
 * McpState holds session context: activeRoleId, focusedGoalId, encounter/experience ids.
 *
 * Tools:
 *   activate — activate a role
 *   focus    — view / switch focused goal
 *   want     — declare a goal
 *   plan     — plan for focused goal
 *   todo     — add task to focused plan
 *   finish   — finish a task → encounter
 *   complete — complete focused plan → encounter
 *   abandon  — abandon focused plan → encounter
 *   reflect  — encounter(s) → experience
 *   realize  — experience(s) → principle
 *   master   — experience(s) → procedure
 *   forget   — remove a node from the individual
 *   skill    — load full skill content by locator
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
  version: "0.11.0",
  instructions,
});

// ========== Helpers ==========

function fmt(process: string, label: string, result: { state: any; process: string }) {
  return render({
    process,
    name: label,
    result,
    cognitiveHint: state.cognitiveHint(process),
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
      // Auto-born if not found
      rolex.individual.born(undefined, roleId);
    }
    state.reset();
    state.activeRoleId = roleId;
    const result = await rolex.role.activate(roleId);
    state.cacheFromActivation(result.state);
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
    if (id) {
      state.focusedGoalId = id;
      state.focusedPlanId = null;
    }
    const goalId = state.requireGoalId();
    const result = rolex.role.focus(goalId);
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
    const roleId = state.requireRoleId();
    const result = rolex.role.want(roleId, goal, id);
    state.focusedGoalId = id;
    state.focusedPlanId = null;
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
    const goalId = state.requireGoalId();
    const result = rolex.role.plan(goalId, plan, id);
    state.focusedPlanId = id;
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
    const planId = state.requirePlanId();
    const result = rolex.role.todo(planId, task, id);
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
    const roleId = state.requireRoleId();
    const result = rolex.role.finish(id, roleId, encounter);
    const encId = result.state.id ?? id;
    state.addEncounter(encId);
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
    const roleId = state.requireRoleId();
    const planId = id ?? state.requirePlanId();
    const result = rolex.role.complete(planId, roleId, encounter);
    const encId = result.state.id ?? planId;
    state.addEncounter(encId);
    if (state.focusedPlanId === planId) state.focusedPlanId = null;
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
    const roleId = state.requireRoleId();
    const planId = id ?? state.requirePlanId();
    const result = rolex.role.abandon(planId, roleId, encounter);
    const encId = result.state.id ?? planId;
    state.addEncounter(encId);
    if (state.focusedPlanId === planId) state.focusedPlanId = null;
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
    state.requireEncounterIds(ids);
    const roleId = state.requireRoleId();
    const result = rolex.role.reflect(ids[0], roleId, experience, id);
    state.consumeEncounters(ids);
    state.addExperience(id);
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
    state.requireExperienceIds(ids);
    const roleId = state.requireRoleId();
    const result = rolex.role.realize(ids[0], roleId, principle, id);
    state.consumeExperiences(ids);
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
    if (ids?.length) state.requireExperienceIds(ids);
    const roleId = state.requireRoleId();
    const result = rolex.role.master(roleId, procedure, id, ids?.[0]);
    if (ids?.length) state.consumeExperiences(ids);
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
    const roleId = state.requireRoleId();
    const result = await rolex.role.forget(id, roleId);
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
