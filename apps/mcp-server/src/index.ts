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
 *   master   — experience(s) → skill
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
    const result = rolex.activate(node);
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
    const result = rolex.focus(goal);
    return fmt("focus", id ?? "current goal", result);
  },
});

// ========== Tools: Execution ==========

server.addTool({
  name: "want",
  description: detail("want"),
  parameters: z.object({
    id: z.string().describe("Goal id (used for focus/reference)"),
    source: z.string().describe("Gherkin Feature source describing the goal"),
  }),
  execute: async ({ id, source }) => {
    const role = state.requireRole();
    const result = rolex.want(role, source, id);
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
    source: z.string().describe("Gherkin Feature source describing the plan"),
  }),
  execute: async ({ source }) => {
    const goal = state.requireGoal();
    const result = rolex.plan(goal, source);
    state.focusedPlan = result.state;
    return fmt("plan", "plan", result);
  },
});

server.addTool({
  name: "todo",
  description: detail("todo"),
  parameters: z.object({
    id: z.string().describe("Task id (used for finish/reference)"),
    source: z.string().describe("Gherkin Feature source describing the task"),
  }),
  execute: async ({ id, source }) => {
    const plan = state.requirePlan();
    const result = rolex.todo(plan, source, id);
    state.register(id, result.state);
    return fmt("todo", id, result);
  },
});

server.addTool({
  name: "finish",
  description: detail("finish"),
  parameters: z.object({
    id: z.string().describe("Task id to finish"),
    experience: z.string().optional().describe("Optional reflection on what was learned"),
  }),
  execute: async ({ id, experience }) => {
    const task = state.resolve(id);
    const role = state.requireRole();
    const result = rolex.finish(task, role, experience);
    state.registerEncounter(id, result.state);
    state.unregister(id);
    return fmt("finish", id, result);
  },
});

server.addTool({
  name: "achieve",
  description: detail("achieve"),
  parameters: z.object({
    experience: z.string().optional().describe("Optional reflection on what was learned"),
  }),
  execute: async ({ experience }) => {
    const goal = state.requireGoal();
    const goalId = goal.id ?? "goal";
    const role = state.requireRole();
    const result = rolex.achieve(goal, role, experience);
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
    experience: z.string().optional().describe("Optional reflection on what was learned"),
  }),
  execute: async ({ experience }) => {
    const goal = state.requireGoal();
    const goalId = goal.id ?? "goal";
    const role = state.requireRole();
    const result = rolex.abandon(goal, role, experience);
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
    source: z.string().optional().describe("Gherkin Feature source for the experience"),
  }),
  execute: async ({ ids, source }) => {
    const encounters = state.resolveEncounters(ids);
    const role = state.requireRole();
    // Use first encounter's information as fallback source
    const fallbackSource = encounters[0]?.information;
    const result = rolex.reflect(encounters[0], role, source || fallbackSource);
    // Remove all selected encounters (first is transformed, rest are consumed)
    for (let i = 1; i < encounters.length; i++) {
      rolex.project(encounters[i]); // verify still exists
      // Additional encounters are just removed — their essence is captured in the experience source
    }
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
    source: z.string().optional().describe("Gherkin Feature source for the principle"),
  }),
  execute: async ({ ids, source }) => {
    const experiences = state.resolveExperiences(ids);
    const knowledge = state.requireKnowledge();
    const fallbackSource = experiences[0]?.information;
    const result = rolex.realize(experiences[0], knowledge, source || fallbackSource);
    state.consumeExperiences(ids);
    return fmt("realize", ids.join("+"), result);
  },
});

server.addTool({
  name: "master",
  description: detail("master"),
  parameters: z.object({
    ids: z.array(z.string()).describe("Experience ids to distill into a skill"),
    source: z.string().optional().describe("Gherkin Feature source for the skill"),
  }),
  execute: async ({ ids, source }) => {
    const experiences = state.resolveExperiences(ids);
    const knowledge = state.requireKnowledge();
    const fallbackSource = experiences[0]?.information;
    const result = rolex.master(experiences[0], knowledge, source || fallbackSource);
    state.consumeExperiences(ids);
    return fmt("master", ids.join("+"), result);
  },
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
