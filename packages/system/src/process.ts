/**
 * Process — how the system tree changes.
 *
 * Three tree primitives:
 *   create    — add a child node under a parent
 *   remove    — delete a node and its subtree
 *   transform — harvest from one branch, produce in another
 *
 * Universal formula:
 *   State = Process(Structure, Information?)
 */
import type { Structure } from "./structure.js";

// ===== Tree Primitives =====

/** create — add a new child node of a structure type. */
export interface Create {
  readonly op: "create";
  readonly structure: Structure;
}

/** remove — delete a node (and its subtree). */
export interface Remove {
  readonly op: "remove";
  readonly structure: Structure;
}

/** transform — harvest from one structure, produce another in a different branch. */
export interface Transform {
  readonly op: "transform";
  readonly from: Structure;
  readonly to: Structure;
}

/** A single tree operation. */
export type TreeOp = Create | Remove | Transform;

// ===== Process =====

/**
 * Process — a named composition of tree operations.
 *
 * Universal formula:
 *   State = Process(Structure, Information?)
 */
export interface Process {
  /** The process name (e.g., "want", "achieve", "reflect"). */
  readonly name: string;

  /** What this process does. */
  readonly description: string;

  /** The structure type this process targets. */
  readonly target: Structure;

  /** The tree operations this process performs, in order. */
  readonly ops: readonly TreeOp[];
}

// ===== State =====

/**
 * State — the projection of a node after a process executes.
 *
 * A State is a Structure snapshot with its subtree.
 */
export interface State extends Structure {
  /** Child states (subtree projection). */
  readonly children?: readonly State[];
}

// ===== Constructors =====

export const create = (structure: Structure): Create =>
  ({ op: "create", structure });

export const remove = (structure: Structure): Remove =>
  ({ op: "remove", structure });

export const transform = (from: Structure, to: Structure): Transform =>
  ({ op: "transform", from, to });

export const process = (
  name: string,
  description: string,
  target: Structure,
  ...ops: TreeOp[]
): Process => ({
  name,
  description,
  target,
  ops,
});
