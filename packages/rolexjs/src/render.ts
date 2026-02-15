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
  focus: (n) => `Focused on goal "${n}".`,

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
  focus: "plan how to achieve it, or add tasks.",

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
//  Detail — longer process descriptions (from .feature files)
// ================================================================

import { processes } from "./descriptions/index.js";

/** Full Gherkin feature content for a process — sourced from .feature files. */
export function detail(process: string): string {
  return processes[process] ?? "";
}
