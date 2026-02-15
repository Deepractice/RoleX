/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Stateful wrapper around the stateless Rolex API.
 * Holds activeRole, focusedGoal, focusedPlan, and a name registry.
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
 *   reflect  — encounter → experience
 *   realize  — experience → principle
 *   master   — experience → skill
 */

import { FastMCP } from "fastmcp";
import { Rolex, detail } from "rolexjs";
import { createGraphRuntime } from "@rolexjs/local-platform";
import { z } from "zod";
import { McpState } from "./state.js";
import { render } from "./render.js";
import { instructions } from "./instructions.js";

// ========== Setup ==========

const rolex = new Rolex({ runtime: createGraphRuntime() });
const state = new McpState(rolex);

// ========== Server ==========

const server = new FastMCP({
  name: "rolex",
  version: "0.10.0",
  instructions,
});

// ========== Helpers ==========

function fmt(process: string, name: string, result: { state: any; process: string }) {
  return render({
    process,
    name,
    result,
    rolex,
    relationsFor: state.activeRole ?? undefined,
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
    name: z.string().optional().describe("Goal name to switch to. Omit to view current."),
  }),
  execute: async ({ name }) => {
    if (name) {
      const goal = state.resolve(name);
      state.focusedGoal = goal;
      state.focusedPlan = null;
    }
    const goal = state.requireGoal();
    const result = rolex.focus(goal);
    return fmt("focus", name ?? "current goal", result);
  },
});

// ========== Tools: Execution ==========

server.addTool({
  name: "want",
  description: detail("want"),
  parameters: z.object({
    name: z.string().describe("Goal name (used for focus/reference)"),
    source: z.string().describe("Gherkin Feature source describing the goal"),
  }),
  execute: async ({ name, source }) => {
    const role = state.requireRole();
    const result = rolex.want(role, source);
    state.register(name, result.state);
    state.focusedGoal = result.state;
    state.focusedPlan = null;
    return fmt("want", name, result);
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
    name: z.string().describe("Task name (used for finish/reference)"),
    source: z.string().describe("Gherkin Feature source describing the task"),
  }),
  execute: async ({ name, source }) => {
    const plan = state.requirePlan();
    const result = rolex.todo(plan, source);
    state.register(name, result.state);
    return fmt("todo", name, result);
  },
});

server.addTool({
  name: "finish",
  description: detail("finish"),
  parameters: z.object({
    name: z.string().describe("Task name to finish"),
    experience: z.string().optional().describe("Optional reflection on what was learned"),
  }),
  execute: async ({ name, experience }) => {
    const task = state.resolve(name);
    const role = state.requireRole();
    const result = rolex.finish(task, role, experience);
    state.pushEncounter(result.state);
    state.unregister(name);
    return fmt("finish", name, result);
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
    const role = state.requireRole();
    const result = rolex.achieve(goal, role, experience);
    state.pushEncounter(result.state);
    state.focusedGoal = null;
    state.focusedPlan = null;
    return fmt("achieve", "goal", result);
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
    const role = state.requireRole();
    const result = rolex.abandon(goal, role, experience);
    state.pushEncounter(result.state);
    state.focusedGoal = null;
    state.focusedPlan = null;
    return fmt("abandon", "goal", result);
  },
});

// ========== Tools: Cognition ==========

server.addTool({
  name: "reflect",
  description: detail("reflect"),
  parameters: z.object({
    source: z.string().optional().describe("Gherkin Feature source for the experience"),
  }),
  execute: async ({ source }) => {
    const encounter = state.popEncounter();
    const role = state.requireRole();
    const result = rolex.reflect(encounter, role, source);
    state.pushExperience(result.state);
    return fmt("reflect", "encounter", result);
  },
});

server.addTool({
  name: "realize",
  description: detail("realize"),
  parameters: z.object({
    source: z.string().optional().describe("Gherkin Feature source for the principle"),
  }),
  execute: async ({ source }) => {
    const exp = state.popExperience();
    const knowledge = state.requireKnowledge();
    const result = rolex.realize(exp, knowledge, source);
    return fmt("realize", "experience", result);
  },
});

server.addTool({
  name: "master",
  description: detail("master"),
  parameters: z.object({
    source: z.string().optional().describe("Gherkin Feature source for the skill"),
  }),
  execute: async ({ source }) => {
    const exp = state.popExperience();
    const knowledge = state.requireKnowledge();
    const result = rolex.master(exp, knowledge, source);
    return fmt("master", "experience", result);
  },
});

// ========== Start ==========

server.start({
  transportType: "stdio",
});
