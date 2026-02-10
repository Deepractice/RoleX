/**
 * Individual System — a role's first-person cognitive lifecycle.
 *
 * Everything here is done BY the role itself:
 * identity → focus → want → design → todo → finish → achieve →
 * abandon → reflect → contemplate → skill
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
  informationTypes: ["persona", "knowledge.pattern", "knowledge.procedure", "knowledge.theory", "experience.insight", "experience.conclusion", "goal", "plan", "task"],
};

// ========== Information ==========

export const PERSONA: InformationType = {
  type: "persona",
  description: "Who the role is — personality, values, background.",
  belongsTo: "Role",
};

export const PATTERN: InformationType = {
  type: "knowledge.pattern",
  description: "Transferable principles — distilled from experience through reflection, or taught directly.",
  belongsTo: "Role",
};

export const PROCEDURE: InformationType = {
  type: "knowledge.procedure",
  description: "Procedural knowledge — what the role knows how to do (workflows, operations).",
  belongsTo: "Role",
};

export const THEORY: InformationType = {
  type: "knowledge.theory",
  description: "Unified principles — the philosophical coherence across all patterns. Produced by contemplate.",
  belongsTo: "Role",
};

export const INSIGHT: InformationType = {
  type: "experience.insight",
  description: "A posteriori knowledge — what the role learned from an encounter. Temporary, consumed by reflect.",
  belongsTo: "Role",
};

export const CONCLUSION: InformationType = {
  type: "experience.conclusion",
  description: "Completion summary — what happened, what was the result.",
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
  includes: ["persona", "knowledge.pattern", "knowledge.procedure", "knowledge.theory", "experience.insight", "experience.conclusion"],
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
  description: "Mark a task complete. Optionally write a conclusion.",
  kind: "write",
  targets: ["Role"],
  inputs: ["task"],
  outputs: ["experience.conclusion"],
};

export const ACHIEVE: ProcessDefinition = {
  name: "achieve",
  description: "Mark the current goal achieved. Write conclusion and distill insight.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience.conclusion", "experience.insight"],
};

export const ABANDON: ProcessDefinition = {
  name: "abandon",
  description: "Mark the current goal abandoned. Optionally write conclusion and distill insight.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience.conclusion", "experience.insight"],
};

export const FORGET: ProcessDefinition = {
  name: "forget",
  description: "Forget information — remove pattern, procedure, theory, or insight from identity.",
  kind: "write",
  targets: ["Role"],
  inputs: ["knowledge.pattern", "knowledge.procedure", "knowledge.theory", "experience.insight"],
  outputs: [],
};

export const REFLECT: ProcessDefinition = {
  name: "reflect",
  description: "Distill insights into patterns — the cognitive upgrade path.",
  kind: "transform",
  targets: ["Role"],
  inputs: ["experience.insight"],
  outputs: ["knowledge.pattern"],
};

export const CONTEMPLATE: ProcessDefinition = {
  name: "contemplate",
  description: "Unify patterns into theory — the philosophical upgrade path.",
  kind: "write",
  targets: ["Role"],
  inputs: ["knowledge.pattern"],
  outputs: ["knowledge.theory"],
};

export const IDENTITY: ProcessDefinition = {
  name: "identity",
  description: "Load the role's complete identity — render cognition frame.",
  kind: "query",
  targets: ["Role"],
  inputs: ["persona", "knowledge.pattern", "knowledge.procedure", "knowledge.theory", "experience.insight", "experience.conclusion"],
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

export const SKILL: ProcessDefinition = {
  name: "skill",
  description: "Load a skill — read the procedure summary and load the full SKILL.md instructions.",
  kind: "query",
  targets: ["Role"],
  inputs: ["knowledge.procedure"],
  outputs: [],
};

export const EXPLORE: ProcessDefinition = {
  name: "explore",
  description: "Explore the RoleX world — discover roles, organizations, and relationships.",
  kind: "query",
  targets: ["Role"],
  inputs: [],
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
  feedback: ["experience.insight"],
};

export const COGNITIVE_GROWTH: SystemDefinition = {
  name: "cognitive-growth",
  description: "The learning cycle — achieve distills experience, reflect turns experience into knowledge, contemplate unifies knowledge into theory.",
  processes: ["achieve", "reflect", "contemplate"],
  feedback: ["knowledge.pattern", "knowledge.theory"],
};
