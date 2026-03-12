/**
 * RoleX tool definitions — the single source of truth for all tool schemas.
 *
 * Channel-agnostic: MCP, CLI, REST, A2A each convert to their own format.
 * Each ToolDef is self-contained: name + description + params.
 */

import { processes, world } from "./descriptions/index.js";
import type { ToolDef } from "./schema.js";

/**
 * Protocol — the complete interface contract for channel adapters.
 *
 * Any adapter (MCP, CLI, REST, A2A) only needs this object
 * to know what tools exist and what instructions to present.
 */
export interface Protocol {
  /** All tool definitions — self-contained with description + parameter schemas. */
  tools: ToolDef[];
  /** World-level instructions — the cognitive framework for AI roles. */
  instructions: string;
}

const worldInstructions: string = Object.values(world).join("\n\n");

/** Shorthand — look up process description, default to empty string. */
const d = (name: string): string => processes[name] ?? "";

const tools: ToolDef[] = [
  // --- Top-level perception ---
  {
    name: "activate",
    description: d("activate"),
    params: {
      roleId: { type: "string", required: true, description: "Role name to activate" },
    },
  },
  {
    name: "inspect",
    description: d("inspect"),
    params: {
      id: { type: "string", required: true, description: "Node id to inspect (any node type)" },
    },
  },
  {
    name: "survey",
    description: d("survey"),
    params: {
      type: {
        type: "string",
        required: false,
        description: "Filter by type: individual, organization, position, past. Omit for all.",
      },
    },
  },
  {
    name: "focus",
    description: d("focus"),
    params: {
      id: {
        type: "string",
        required: false,
        description: "Goal id to switch to. Omit to view current.",
      },
    },
  },

  // --- Execution ---
  {
    name: "want",
    description: d("want"),
    params: {
      id: { type: "string", required: true, description: "Goal id (used for focus/reference)" },
      goal: {
        type: "gherkin",
        required: true,
        description: "Gherkin Feature source describing the goal",
      },
    },
  },
  {
    name: "plan",
    description: d("plan"),
    params: {
      id: {
        type: "string",
        required: true,
        description: "Plan id — keywords from the plan content joined by hyphens",
      },
      plan: {
        type: "gherkin",
        required: true,
        description: "Gherkin Feature source describing the plan",
      },
      after: {
        type: "string",
        required: false,
        description: "Plan id this plan follows (sequential/phase relationship)",
      },
      fallback: {
        type: "string",
        required: false,
        description: "Plan id this plan is a backup for (alternative/strategy relationship)",
      },
    },
  },
  {
    name: "todo",
    description: d("todo"),
    params: {
      id: { type: "string", required: true, description: "Task id (used for finish/reference)" },
      task: {
        type: "gherkin",
        required: true,
        description: "Gherkin Feature source describing the task",
      },
    },
  },
  {
    name: "finish",
    description: d("finish"),
    params: {
      id: { type: "string", required: true, description: "Task id to finish" },
      encounter: {
        type: "gherkin",
        required: false,
        description: "Optional Gherkin Feature describing what happened",
      },
    },
  },
  {
    name: "complete",
    description: d("complete"),
    params: {
      id: {
        type: "string",
        required: false,
        description: "Plan id to complete (defaults to focused plan)",
      },
      encounter: {
        type: "gherkin",
        required: false,
        description: "Optional Gherkin Feature describing what happened",
      },
    },
  },
  {
    name: "abandon",
    description: d("abandon"),
    params: {
      id: {
        type: "string",
        required: false,
        description: "Plan id to abandon (defaults to focused plan)",
      },
      encounter: {
        type: "gherkin",
        required: false,
        description: "Optional Gherkin Feature describing what happened",
      },
    },
  },

  // --- Cognition ---
  {
    name: "reflect",
    description: d("reflect"),
    params: {
      ids: {
        type: "string[]",
        required: true,
        description: "Encounter ids to reflect on (selective consumption)",
      },
      id: {
        type: "string",
        required: true,
        description: "Experience id — keywords from the experience content joined by hyphens",
      },
      experience: {
        type: "gherkin",
        required: false,
        description: "Gherkin Feature source for the experience",
      },
    },
  },
  {
    name: "realize",
    description: d("realize"),
    params: {
      ids: {
        type: "string[]",
        required: true,
        description: "Experience ids to distill into a principle",
      },
      id: {
        type: "string",
        required: true,
        description: "Principle id — keywords from the principle content joined by hyphens",
      },
      principle: {
        type: "gherkin",
        required: false,
        description: "Gherkin Feature source for the principle",
      },
    },
  },
  {
    name: "master",
    description: d("master"),
    params: {
      ids: {
        type: "string[]",
        required: false,
        description: "Experience ids to distill into a procedure",
      },
      id: {
        type: "string",
        required: true,
        description: "Procedure id — keywords from the procedure content joined by hyphens",
      },
      procedure: {
        type: "gherkin",
        required: true,
        description: "Gherkin Feature source for the procedure",
      },
    },
  },

  // --- Knowledge ---
  {
    name: "forget",
    description: d("forget"),
    params: {
      id: {
        type: "string",
        required: true,
        description: "Id of the node to remove (principle, procedure, experience, encounter, etc.)",
      },
    },
  },
  {
    name: "skill",
    description: d("skill"),
    params: {
      locator: {
        type: "string",
        required: true,
        description: "ResourceX locator for the skill (e.g. deepractice/role-management)",
      },
    },
  },

  // --- Use / Direct ---
  {
    name: "use",
    description: d("use"),
    params: {
      command: {
        type: "string",
        required: true,
        description: "!namespace.method for RoleX commands, or a ResourceX locator for resources",
      },
      args: {
        type: "record",
        required: false,
        description:
          "Named arguments object for the command. Pass all parameters as key-value pairs in this object (e.g. id, content, org, individual). Must be a JSON object, not a string. Load the relevant skill first to learn what args to pass.",
      },
    },
  },
  {
    name: "direct",
    description: d("direct"),
    params: {
      command: {
        type: "string",
        required: true,
        description: "!namespace.method for RoleX commands, or a ResourceX locator for resources",
      },
      args: {
        type: "record",
        required: false,
        description:
          "Named arguments object for the command. Pass all parameters as key-value pairs in this object (e.g. id, content, type). Must be a JSON object, not a string. Load the relevant skill first to learn what args to pass.",
      },
    },
  },
];

/** The protocol instance — single source of truth for all channel adapters. */
export const protocol: Protocol = { tools, instructions: worldInstructions };
