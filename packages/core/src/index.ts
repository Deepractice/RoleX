/**
 * @rolexjs/core — RoleX Concept World
 *
 * Domain-specific structures and processes built on @rolexjs/system.
 *
 * Structures — the concept tree (18 concepts, 2 relations)
 * Processes  — how the world changes (24 processes, 4 layers)
 *
 *   Layer 1: Execution   — want, plan, todo, finish, complete, abandon
 *   Layer 2: Cognition   — reflect, realize, master
 *   Layer 3: Organization — hire, fire, appoint, dismiss, charter, charge
 *   Layer 4: Lifecycle   — born, found, establish, retire, die, dissolve, abolish, rehire
 *   + Role: activate
 */

// Re-export system primitives
export {
  type Create,
  create,
  createRuntime,
  type GraphOp,
  type Link,
  link,
  type Process,
  process,
  type Relation,
  type Remove,
  type Runtime,
  relation,
  remove,
  type State,
  type Structure,
  structure,
  type Transform,
  transform,
  type Unlink,
  unlink,
} from "@rolexjs/system";

// Platform
export type { ContextData, Platform } from "./platform.js";

// ===== Structures =====

export {
  background,
  // Organization
  charter,
  duty,
  // Individual — Cognition
  encounter,
  experience,
  // Individual — Execution
  goal,
  // Individual — Identity
  identity,
  // Level 1
  individual,
  // Individual — Knowledge
  mindset,
  organization,
  past,
  plan,
  position,
  principle,
  procedure,
  // Organization — Position
  requirement,
  // Level 0
  society,
  task,
  tone,
} from "./structures.js";

// ===== Processes — Layer 1: Execution =====

export { abandon, complete, finish, planGoal, todo, want } from "./execution.js";

// ===== Processes — Layer 2: Cognition =====

export { master, realize, reflect } from "./cognition.js";

// ===== Processes — Layer 3: Organization =====

export { appoint, charge, charterOrg, dismiss, fire, hire } from "./organization.js";

// ===== Processes — Layer 4: Lifecycle =====

export { abolish, born, die, dissolve, establish, found, rehire, retire } from "./lifecycle.js";

// ===== Role =====

export { activate } from "./role.js";
