/**
 * Render — description + hint templates for every process.
 *
 * Each operation produces two pieces of text:
 *   description — what just happened (past tense)
 *   hint        — what to do next (suggestion)
 *
 * These are shared by MCP and CLI. The I/O layer just presents them.
 */
import type { State } from "@rolexjs/system";

// ================================================================
//  Description — what happened
// ================================================================

const descriptions: Record<string, (name: string, state: State) => string> = {
  // Lifecycle
  born: (n) => `Individual "${n}" is born.`,
  found: (n) => `Organization "${n}" is founded.`,
  establish: (n) => `Position "${n}" is established.`,
  charter: (n) => `Charter defined for "${n}".`,
  charge: (n) => `Duty "${n}" assigned.`,
  retire: (n) => `"${n}" retired.`,
  die: (n) => `"${n}" is gone.`,
  dissolve: (n) => `Organization "${n}" dissolved.`,
  abolish: (n) => `Position "${n}" abolished.`,
  rehire: (n) => `"${n}" is back.`,

  // Organization
  hire: (n) => `"${n}" hired.`,
  fire: (n) => `"${n}" fired.`,
  appoint: (n) => `"${n}" appointed.`,
  dismiss: (n) => `"${n}" dismissed.`,

  // Role
  activate: (n) => `Role "${n}" activated.`,

  // Execution
  want: (n) => `Goal "${n}" declared.`,
  plan: (n) => `Plan created for "${n}".`,
  todo: (n) => `Task "${n}" added.`,
  finish: (n) => `Task "${n}" finished → encounter recorded.`,
  achieve: (n) => `Goal "${n}" achieved → encounter recorded.`,
  abandon: (n) => `Goal "${n}" abandoned → encounter recorded.`,

  // Cognition
  reflect: (n) => `Reflected on "${n}" → experience gained.`,
  realize: (n) => `Realized principle from "${n}".`,
  master: (n) => `Mastered skill from "${n}".`,
};

export function describe(process: string, name: string, state: State): string {
  const fn = descriptions[process];
  return fn ? fn(name, state) : `${process} completed.`;
}

// ================================================================
//  Hint — what to do next
// ================================================================

const hints: Record<string, string> = {
  // Lifecycle
  born: "hire into an organization, or activate to start working.",
  found: "establish positions and define a charter.",
  establish: "charge with duties, then appoint members.",
  charter: "establish positions for the organization.",
  charge: "appoint someone to this position.",
  retire: "rehire if needed later.",
  die: "this individual is permanently gone.",
  dissolve: "the organization no longer exists.",
  abolish: "the position no longer exists.",
  rehire: "activate to resume working.",

  // Organization
  hire: "appoint to a position, or activate to start working.",
  fire: "the individual is no longer a member.",
  appoint: "the individual now holds this position.",
  dismiss: "the position is now vacant.",

  // Role
  activate: "want a goal, or check the current state.",

  // Execution
  want: "plan how to achieve it.",
  plan: "add tasks with todo.",
  todo: "start working, finish when done.",
  finish: "continue with remaining tasks, or achieve the goal.",
  achieve: "reflect on encounters to gain experience.",
  abandon: "reflect on encounters to learn from the experience.",

  // Cognition
  reflect: "realize principles or master skills from experience.",
  realize: "principle added to knowledge.",
  master: "skill added to knowledge.",
};

export function hint(process: string): string {
  const h = hints[process];
  return h ? `Next: ${h}` : "What would you like to do next?";
}

// ================================================================
//  Detail — longer process descriptions
// ================================================================

const details: Record<string, string> = {
  // Lifecycle — Creation
  born: "Create a new individual with persona identity. The persona defines who the role is — personality, values, background. A born individual can be hired into organizations and activated to start working.",
  found: "Found a new organization. Organizations group individuals and define positions. After founding, establish positions, define a charter, and hire members.",
  establish: "Create a position within an organization. Positions define roles within the org and can be charged with duties. Members can be appointed to positions.",
  charter: "Define the charter for an organization. The charter describes the organization's mission, principles, and governance rules.",
  charge: "Assign a duty to a position. Duties describe the responsibilities and expectations of a position. Appointees inherit these duties as part of their identity.",

  // Lifecycle — Archival
  retire: "Archive an individual — deactivate but preserve all data. A retired individual can be rehired later with full history intact.",
  die: "Permanently remove an individual. Unlike retire, this is irreversible — the individual and all associated data are gone.",
  dissolve: "Dissolve an organization. All positions, charter entries, and assignments within the organization are cascaded.",
  abolish: "Abolish a position within an organization. All duties and appointments associated with the position are removed.",
  rehire: "Rehire a retired individual from the past. Restores the individual with full history and knowledge intact.",

  // Organization
  hire: "Hire an individual into an organization as a member. Members can then be appointed to positions within the organization.",
  fire: "Fire an individual from an organization. The individual is dismissed from all positions and removed from the organization.",
  appoint: "Appoint an individual to a position. The individual must be a member of the organization. Appointed individuals inherit the position's duties.",
  dismiss: "Dismiss an individual from a position. The individual remains a member of the organization but no longer holds the position.",

  // Role
  activate: "Activate a role — project the individual's full state including identity, knowledge, goals, and organizational context. This is the entry point for working as a role.",

  // Execution
  want: "Declare a new goal. A goal describes a desired outcome with Gherkin scenarios as success criteria. The goal becomes the current focus for subsequent plan and todo operations.",
  plan: "Create a plan for a goal. The plan breaks the goal into logical phases or stages, each described as a Gherkin scenario. Tasks are then created under the plan.",
  todo: "Add a task to a plan. A task is a concrete, actionable unit of work — finishable in one session. Each task has Gherkin scenarios describing the steps and expected outcomes.",
  finish: "Finish a task — marks it done and creates an encounter. The encounter records what happened. Optionally capture what was learned as experience text.",
  achieve: "Achieve a goal — marks it done and creates an encounter. Call this when the goal's success criteria are met. The encounter can be reflected on for learning.",
  abandon: "Abandon a goal — marks it dropped and creates an encounter. Call this when a goal is no longer viable. Even failed goals produce learning through the encounter.",

  // Cognition
  reflect: "Reflect on the latest encounter — consumes it and creates an experience. Experience captures what was learned in structured form. This is the first step of the cognition cycle.",
  realize: "Distill experience into a principle — a transferable piece of knowledge added to the individual's knowledge branch. Principles are general truths discovered through experience.",
  master: "Distill experience into a skill — a procedural piece of knowledge added to the individual's knowledge branch. Skills represent learned capabilities.",
};

/** Longer description of what a process does — suitable for help text and documentation. */
export function detail(process: string): string {
  return details[process] ?? "";
}
