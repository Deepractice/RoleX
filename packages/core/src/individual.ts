/**
 * Individual System — a role's first-person cognitive lifecycle.
 *
 * Everything here is done BY the role itself:
 * identity → focus → want → design → todo → finish → achieve →
 * abandon → synthesize → reflect → apply
 *
 * External processes (born, teach, train, retire, kill)
 * belong to the Role System.
 */

import type {
  InformationType,
  StructureDefinition,
  StateDefinition,
  ProcessDefinition,
  SystemDefinition,
} from "@rolexjs/system";

// ========== Structure ==========

export const ROLE: StructureDefinition = {
  name: "Role",
  description: "The individual — an identity that accumulates knowledge, experience, and pursues goals.",
  informationTypes: ["persona", "knowledge", "procedure", "experience", "goal", "plan", "task"],
};

// ========== Information ==========

export const PERSONA: InformationType = {
  type: "persona",
  description: "Who the role is — personality, values, background.",
  belongsTo: "Role",
};

export const KNOWLEDGE: InformationType = {
  type: "knowledge",
  description: "Declarative knowledge — what the role knows (facts, concepts, principles).",
  belongsTo: "Role",
};

export const PROCEDURE: InformationType = {
  type: "procedure",
  description: "Procedural knowledge — what the role knows how to do (workflows, operations).",
  belongsTo: "Role",
};

export const EXPERIENCE: InformationType = {
  type: "experience",
  description: "A posteriori knowledge — what the role has learned from encounters.",
  belongsTo: "Role",
};

export const GOAL: InformationType = {
  type: "goal",
  description: "What the role wants to achieve — a desired outcome.",
  belongsTo: "Role",
};

export const PLAN: InformationType = {
  type: "plan",
  description: "How to achieve a goal — a decomposition into phases or steps.",
  belongsTo: "Role",
};

export const TASK: InformationType = {
  type: "task",
  description: "A concrete unit of work within a plan.",
  belongsTo: "Role",
};

// ========== State ==========

export const COGNITION: StateDefinition = {
  name: "cognition",
  description: "The role's self-awareness — who am I, what do I know.",
  appliesTo: "Role",
  producedBy: "identity",
  includes: ["persona", "knowledge", "procedure", "experience"],
};

export const INTENTION: StateDefinition = {
  name: "intention",
  description: "The role's current direction — what am I doing, what's next.",
  appliesTo: "Role",
  producedBy: "focus",
  includes: ["goal", "plan", "task"],
};

// ========== Process (all first-person) ==========

export const WANT: ProcessDefinition = {
  name: "want",
  description: "Declare a goal for the role.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["goal"],
};

export const DESIGN: ProcessDefinition = {
  name: "design",
  description: "Write a plan for the current goal.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["plan"],
};

export const TODO: ProcessDefinition = {
  name: "todo",
  description: "Create a task under the current plan.",
  kind: "write",
  targets: ["Role"],
  inputs: ["plan"],
  outputs: ["task"],
};

export const FINISH: ProcessDefinition = {
  name: "finish",
  description: "Mark a task complete. Optionally synthesize experience.",
  kind: "write",
  targets: ["Role"],
  inputs: ["task"],
  outputs: ["experience"],
};

export const ACHIEVE: ProcessDefinition = {
  name: "achieve",
  description: "Mark the current goal achieved. Optionally synthesize experience.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience"],
};

export const ABANDON: ProcessDefinition = {
  name: "abandon",
  description: "Mark the current goal abandoned. Optionally synthesize experience.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience"],
};

export const SYNTHESIZE: ProcessDefinition = {
  name: "synthesize",
  description: "Turn encounters into experience — a posteriori learning.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["experience"],
};

export const REFLECT: ProcessDefinition = {
  name: "reflect",
  description: "Distill experiences into knowledge — the cognitive upgrade path.",
  kind: "transform",
  targets: ["Role"],
  inputs: ["experience"],
  outputs: ["knowledge"],
};

export const IDENTITY: ProcessDefinition = {
  name: "identity",
  description: "Load the role's complete identity — render cognition frame.",
  kind: "query",
  targets: ["Role"],
  inputs: ["persona", "knowledge", "procedure", "experience"],
  outputs: [],
};

export const FOCUS: ProcessDefinition = {
  name: "focus",
  description: "Load the current goal context — render intention frame.",
  kind: "query",
  targets: ["Role"],
  inputs: ["goal", "plan", "task"],
  outputs: [],
};

export const APPLY: ProcessDefinition = {
  name: "apply",
  description: "Apply a skill — load procedural knowledge into the current context.",
  kind: "query",
  targets: ["Role"],
  inputs: ["procedure"],
  outputs: [],
};

export const USE: ProcessDefinition = {
  name: "use",
  description: "Use an external tool — resolve a resource locator and execute it.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

// ========== System (cycles) ==========

export const GOAL_EXECUTION: SystemDefinition = {
  name: "goal-execution",
  description: "The doing cycle — set goals, make plans, execute tasks, achieve.",
  processes: ["identity", "want", "design", "todo", "finish", "achieve"],
  feedback: ["experience"],
};

export const COGNITIVE_GROWTH: SystemDefinition = {
  name: "cognitive-growth",
  description: "The learning cycle — synthesize encounters into experience, reflect into knowledge.",
  processes: ["synthesize", "reflect"],
  feedback: ["knowledge"],
};
