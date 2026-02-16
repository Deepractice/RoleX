/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Stateful wrapper around the stateless Rolex API.
 * Holds activeRole, focusedGoal, focusedPlan, and id registries.
 *
 * Tools:
 *   activate — activate a role
 *   focus    — view / switch focused goal
 *   want     — declare a goal
 *   plan     — plan for focused goal
 *   todo     — add task to focused plan
 *   finish   — finish a task → encounter
 *   achieve  — achieve focused goal → encounter
 *   abandon  — abandon focused goal → encounter
 *   reflect  — encounter(s) → experience
 *   realize  — experience(s) → principle
 *   master   — experience(s) → procedure
 *   skill    — load full skill content by locator
 */

import { FastMCP } from "fastmcp";
import { createRoleX, detail } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";
import { z } from "zod";
import { McpState } from "./state.js";
import { render } from "./render.js";
import { instructions } from "./instructions.js";

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
    const node = state.findIndividual(roleId);
    if (!node) throw new Error(`Role not found: "${roleId}"`);
    state.activeRole = node;
    const result = rolex.role.activate(node);
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
      const goal = state.resolve(id);
      state.focusedGoal = goal;
      state.focusedPlan = null;
    }
    const goal = state.requireGoal();
    const result = rolex.role.focus(goal);
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
    const result = rolex.role.want(role, goal, id);
    state.register(id, result.state);
    state.focusedGoal = result.state;
    state.focusedPlan = null;
    return fmt("want", id, result);
  },
});

server.addTool({
  name: "plan",
  description: detail("plan"),
  parameters: z.object({
    plan: z.string().describe("Gherkin Feature source describing the plan"),
  }),
  execute: async ({ plan }) => {
    const goal = state.requireGoal();
    const result = rolex.role.plan(goal, plan);
    state.focusedPlan = result.state;
    return fmt("plan", "plan", result);
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
    const plan = state.requirePlan();
    const result = rolex.role.todo(plan, task, id);
    state.register(id, result.state);
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
    const task = state.resolve(id);
    const role = state.requireRole();
    const result = rolex.role.finish(task, role, encounter);
    state.registerEncounter(id, result.state);
    state.unregister(id);
    return fmt("finish", id, result);
  },
});

server.addTool({
  name: "achieve",
  description: detail("achieve"),
  parameters: z.object({
    encounter: z.string().optional().describe("Optional Gherkin Feature describing what happened"),
  }),
  execute: async ({ encounter }) => {
    const goal = state.requireGoal();
    const goalId = goal.id ?? "goal";
    const role = state.requireRole();
    const result = rolex.role.achieve(goal, role, encounter);
    state.registerEncounter(goalId, result.state);
    state.focusedGoal = null;
    state.focusedPlan = null;
    return fmt("achieve", goalId, result);
  },
});

server.addTool({
  name: "abandon",
  description: detail("abandon"),
  parameters: z.object({
    encounter: z.string().optional().describe("Optional Gherkin Feature describing what happened"),
  }),
  execute: async ({ encounter }) => {
    const goal = state.requireGoal();
    const goalId = goal.id ?? "goal";
    const role = state.requireRole();
    const result = rolex.role.abandon(goal, role, encounter);
    state.registerEncounter(goalId, result.state);
    state.focusedGoal = null;
    state.focusedPlan = null;
    return fmt("abandon", goalId, result);
  },
});

// ========== Tools: Cognition ==========

server.addTool({
  name: "reflect",
  description: detail("reflect"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Encounter ids to reflect on (selective consumption)"),
    experience: z.string().optional().describe("Gherkin Feature source for the experience"),
  }),
  execute: async ({ ids, experience }) => {
    const encounters = state.resolveEncounters(ids);
    const role = state.requireRole();
    const fallbackSource = encounters[0]?.information;
    const result = rolex.role.reflect(encounters[0], role, experience || fallbackSource);
    state.consumeEncounters(ids);
    const expId = ids.join("+");
    state.registerExperience(expId, result.state);
    return fmt("reflect", expId, result);
  },
});

server.addTool({
  name: "realize",
  description: detail("realize"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Experience ids to distill into a principle"),
    principle: z.string().optional().describe("Gherkin Feature source for the principle"),
  }),
  execute: async ({ ids, principle }) => {
    const experiences = state.resolveExperiences(ids);
    const knowledge = state.requireKnowledge();
    const fallbackSource = experiences[0]?.information;
    const result = rolex.role.realize(experiences[0], knowledge, principle || fallbackSource);
    state.consumeExperiences(ids);
    return fmt("realize", ids.join("+"), result);
  },
});

server.addTool({
  name: "master",
  description: detail("master"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Experience ids to distill into a procedure"),
    procedure: z.string().optional().describe("Gherkin Feature source for the procedure"),
  }),
  execute: async ({ ids, procedure }) => {
    const experiences = state.resolveExperiences(ids);
    const knowledge = state.requireKnowledge();
    const fallbackSource = experiences[0]?.information;
    const result = rolex.role.master(experiences[0], knowledge, procedure || fallbackSource);
    state.consumeExperiences(ids);
    return fmt("master", ids.join("+"), result);
  },
});

// ========== Tools: Skill loading ==========

server.addTool({
  name: "skill",
  description: detail("skill"),
  parameters: z.object({
    locator: z.string().describe("ResourceX locator for the skill (e.g. deepractice/role-management:1.0.0)"),
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
