/**
 * RoleX tool definitions — the single source of truth for all tool schemas.
 *
 * Channel-agnostic: MCP, CLI, REST, A2A each convert to their own format.
 * Description for each tool comes from descriptions/processes via detail().
 * This file only defines the parameter schema.
 */

import { world } from "./descriptions/index.js";
import type { ToolDef } from "./schema.js";

/**
 * Protocol — the complete interface contract for channel adapters.
 *
 * Any adapter (MCP, CLI, REST, A2A) only needs this object
 * to know what tools exist and what instructions to present.
 */
export interface Protocol {
  /** All tool definitions with parameter schemas. */
  tools: ToolDef[];
  /** World-level instructions — the cognitive framework for AI roles. */
  instructions: string;
}

const worldInstructions: string = Object.values(world).join("\n\n");

const tools: ToolDef[] = [
  // --- Top-level perception ---
  {
    name: "activate",
    params: {
      roleId: { type: "string", required: true, description: "Role name to activate" },
    },
  },
  {
    name: "inspect",
    params: {
      id: { type: "string", required: true, description: "Node id to inspect (any node type)" },
    },
  },
  {
    name: "survey",
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
