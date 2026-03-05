/**
 * @rolexjs/core — RoleX Concept World
 *
 * Domain-specific structures and processes built on @rolexjs/system.
 *
 * Structures — the concept tree (23 concepts, 3 relations)
 * Processes  — how the world changes (32 processes, 5 layers)
 *
 *   Layer 1: Execution   — want, plan, todo, finish, complete, abandon
 *   Layer 2: Cognition   — reflect, realize, master
 *   Layer 3: Organization — hire, fire, appoint, dismiss, charter, charge
 *   Layer 3b: Project    — enroll, remove, scope, milestone, deliver, wiki
 *   Layer 4: Lifecycle   — born, found, establish, launch, retire, die, dissolve, abolish, archive, rehire
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
export type {
  ContextData,
  Migration,
  MigrationRecord,
  Platform,
  PrototypeData,
  PrototypeRepository,
  RoleXRepository,
} from "./platform.js";

// ===== Structures =====

export {
  background,
  // Organization
  charter,
  // Project
  deliverable,
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
  // Project
  milestone,
  // Individual — Knowledge
  mindset,
  organization,
  past,
  plan,
  position,
  principle,
  procedure,
  // Project
  project,
  // Organization — Position
  requirement,
  // Project
  scope,
  // Level 0
  society,
  task,
  tone,
  // Project
  wiki,
} from "./structures.js";

// ===== Processes — Layer 1: Execution =====

export { abandon, complete, finish, planGoal, todo, want } from "./execution.js";

// ===== Processes — Layer 2: Cognition =====

export { master, realize, reflect } from "./cognition.js";

// ===== Processes — Layer 3: Organization =====

export { appoint, charge, charterOrg, dismiss, fire, hire } from "./organization.js";

// ===== Processes — Layer 3b: Project =====

export {
  deliverProject,
  enroll,
  milestoneProject,
  removeParticipant,
  scopeProject,
  wikiProject,
} from "./project.js";

// ===== Processes — Layer 4: Lifecycle =====

export {
  abolish,
  archive,
  born,
  die,
  dissolve,
  establish,
  found,
  launch,
  rehire,
  retire,
} from "./lifecycle.js";

// ===== Role =====

export { activate } from "./role.js";
