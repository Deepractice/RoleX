/**
 * @rolexjs/core — RoleX Core Concepts
 *
 * Domain-specific structures and processes built on @rolexjs/system.
 * Includes the individual structure tree, 14 processes, and descriptions.
 */

// Re-export system primitives
export {
  type Structure,
  type Create,
  type Remove,
  type Transform,
  type TreeOp,
  type Process,
  type State,
  type Runtime,
  structure,
  create,
  remove,
  transform,
  process,
  createRuntime,
} from "@rolexjs/system";

// ===== Individual structure tree =====

export {
  society,
  individual,
  organization,
  persona,
  voice,
  memoir,
  philosophy,
  knowledge,
  pattern,
  procedure,
  theory,
  experience,
  insight,
  conclusion,
  goal,
  plan,
  task,
} from "./individual.js";

// ===== Individual processes =====

export {
  identity,
  focus,
  explore,
  skill,
  use,
  want,
  design,
  todo,
  forget,
  finish,
  achieve,
  abandon,
  reflect,
  contemplate,
} from "./individual.js";
