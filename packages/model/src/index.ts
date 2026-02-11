/**
 * @rolexjs/system — Systems Theory Meta-Model + Runtime
 *
 * Six concepts describe a system:
 *
 *   Information  — the content (what exists)
 *   Structure    — the container (where information lives)
 *   Relation     — the connection (how structures link)
 *   State        — the frame (snapshot at a point in time)
 *   Process      — the change (how frames advance)
 *   System       — the cycle (processes forming a closed loop)
 *
 * defineSystem() turns declarative definitions into runnable systems.
 */

// ========== Declarative (six concepts) ==========

export type { InformationType } from "./information.js";
export type { StructureDefinition } from "./structure.js";
export type { RelationDefinition } from "./relation.js";
export type { StateDefinition } from "./state.js";
export type { ProcessDefinition, ProcessKind } from "./process.js";
export type { SystemDefinition } from "./system.js";

// ========== Platform (storage for three storable concepts) ==========

export type {
  Platform,
  SerializedGraph,
  SerializedNode,
  SerializedEdge,
} from "./platform.js";

// ========== Runtime ==========

export { defineSystem } from "./runtime.js";
export type {
  GraphModel,
  BaseProvider,
  ProcessContext,
  Process,
  SystemConfig,
  RunnableSystem,
} from "./runtime.js";

// ========== Model (blueprint) ==========

import type { InformationType } from "./information.js";
import type { StructureDefinition } from "./structure.js";
import type { RelationDefinition } from "./relation.js";
import type { StateDefinition } from "./state.js";
import type { ProcessDefinition } from "./process.js";
import type { SystemDefinition } from "./system.js";

/**
 * Model — the complete declarative definition of a world.
 *
 * Integrates all six concepts into a single blueprint.
 * This describes what the world IS — not any runtime instance.
 */
export interface Model {
  readonly name: string;
  readonly description: string;
  readonly informationTypes: readonly InformationType[];
  readonly structures: readonly StructureDefinition[];
  readonly relations: readonly RelationDefinition[];
  readonly states: readonly StateDefinition[];
  readonly processes: readonly ProcessDefinition[];
  readonly systems: readonly SystemDefinition[];
}
