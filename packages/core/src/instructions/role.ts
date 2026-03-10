import { def } from "./def.js";

export const roleActivate = def(
  "role",
  "activate",
  {
    individual: {
      type: "string",
      required: true,
      description: "Individual id to activate as role",
    },
  },
  ["individual"]
);

export const roleFocus = def(
  "role",
  "focus",
  {
    goal: { type: "string", required: true, description: "Goal id to switch to" },
  },
  ["goal"]
);

export const roleWant = def(
  "role",
  "want",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    goal: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the goal",
    },
    id: { type: "string", required: true, description: "Goal id (used for focus/reference)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["individual", "goal", "id", "alias"]
);

export const rolePlan = def(
  "role",
  "plan",
  {
    goal: { type: "string", required: true, description: "Goal id" },
    plan: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the plan",
    },
    id: { type: "string", required: true, description: "Plan id (keywords joined by hyphens)" },
    after: {
      type: "string",
      required: false,
      description: "Plan id this plan follows (sequential/phase)",
    },
    fallback: {
      type: "string",
      required: false,
      description: "Plan id this plan is a backup for (alternative/strategy)",
    },
  },
  ["goal", "plan", "id", "after", "fallback"]
);

export const roleTodo = def(
  "role",
  "todo",
  {
    plan: { type: "string", required: true, description: "Plan id" },
    task: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the task",
    },
    id: { type: "string", required: true, description: "Task id (used for finish/reference)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["plan", "task", "id", "alias"]
);

export const roleFinish = def(
  "role",
  "finish",
  {
    task: { type: "string", required: true, description: "Task id to finish" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["task", "individual", "encounter"]
);

export const roleComplete = def(
  "role",
  "complete",
  {
    plan: { type: "string", required: true, description: "Plan id to complete" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["plan", "individual", "encounter"]
);

export const roleAbandon = def(
  "role",
  "abandon",
  {
    plan: { type: "string", required: true, description: "Plan id to abandon" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["plan", "individual", "encounter"]
);

export const roleReflect = def(
  "role",
  "reflect",
  {
    encounter: { type: "string", required: true, description: "Encounter id to reflect on" },
    individual: { type: "string", required: true, description: "Individual id" },
    experience: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the experience",
    },
    id: {
      type: "string",
      required: true,
      description: "Experience id (keywords joined by hyphens)",
    },
  },
  ["encounter", "individual", "experience", "id"]
);

export const roleRealize = def(
  "role",
  "realize",
  {
    experience: { type: "string", required: true, description: "Experience id to distill" },
    individual: { type: "string", required: true, description: "Individual id" },
    principle: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the principle",
    },
    id: {
      type: "string",
      required: true,
      description: "Principle id (keywords joined by hyphens)",
    },
  },
  ["experience", "individual", "principle", "id"]
);

export const roleMaster = def(
  "role",
  "master",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    procedure: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the procedure",
    },
    id: {
      type: "string",
      required: true,
      description: "Procedure id (keywords joined by hyphens)",
    },
    experience: {
      type: "string",
      required: false,
      description: "Experience id to consume (optional)",
    },
  },
  ["individual", "procedure", "id", "experience"]
);

export const roleForget = def(
  "role",
  "forget",
  {
    id: { type: "string", required: true, description: "Id of the node to remove" },
    individual: { type: "string", required: true, description: "Individual id (owner)" },
  },
  ["id", "individual"]
);

export const roleSkill = def(
  "role",
  "skill",
  {
    locator: { type: "string", required: true, description: "ResourceX locator for the skill" },
  },
  ["locator"]
);
