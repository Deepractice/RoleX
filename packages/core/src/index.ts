/**
 * @rolexjs/core — RoleX Concept World
 *
 * Domain-specific structures and processes built on @rolexjs/system.
 *
 * Structures — the concept tree (19 concepts, 2 relations)
 * Processes  — how the world changes (24 processes, 4 layers)
 *
 *   Layer 1: Execution   — want, plan, todo, finish, achieve, abandon
 *   Layer 2: Cognition   — reflect, realize, master
 *   Layer 3: Organization — hire, fire, appoint, dismiss, charter, charge
 *   Layer 4: Lifecycle   — born, found, establish, retire, die, dissolve, abolish, rehire
 *   + Role: activate
 */

// Re-export system primitives
export {
  type Structure,
  type Relation,
  type Create,
  type Remove,
  type Transform,
  type Link,
  type Unlink,
  type GraphOp,
  type Process,
  type State,
  type Runtime,
  structure,
  relation,
  create,
  remove,
  transform,
  link,
  unlink,
  process,
  createRuntime,
} from "@rolexjs/system";

// Platform
export type { Platform } from "./platform.js";

// ===== Structures =====

export {
  // Level 0
  society,
  // Level 1
  individual,
  organization,
  past,
  // Individual — Identity
  identity,
  background,
  tone,
  mindset,
  // Individual — Cognition
  encounter,
  experience,
  // Individual — Knowledge
  knowledge,
  principle,
  procedure,
  // Individual — Execution
  goal,
  plan,
  task,
  // Organization
  charter,
  position,
  duty,
} from "./structures.js";

// ===== Processes — Layer 1: Execution =====

export { want, planGoal, todo, finish, achieve, abandon } from "./execution.js";

// ===== Processes — Layer 2: Cognition =====

export { reflect, realize, master } from "./cognition.js";

// ===== Processes — Layer 3: Organization =====

export { hire, fire, appoint, dismiss, charterOrg, charge } from "./organization.js";

// ===== Processes — Layer 4: Lifecycle =====

export { born, found, establish, retire, die, dissolve, abolish, rehire } from "./lifecycle.js";

// ===== Role =====

export { activate } from "./role.js";
