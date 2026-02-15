/**
 * Process — how the system graph changes.
 *
 * Five graph primitives:
 *   create    — add a child node under a parent
 *   remove    — delete a node and its subtree
 *   transform — harvest from one branch, produce in another
 *   link      — establish a cross-branch relation
 *   unlink    — remove a cross-branch relation
 *
 * Universal formula:
 *   State = Process(Structure, Information?)
 */
import type { Structure } from "./structure.js";

// ===== Graph Primitives =====

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

/** link — establish a cross-branch relation. */
export interface Link {
  readonly op: "link";
  readonly structure: Structure;
  readonly relation: string;
}

/** unlink — remove a cross-branch relation. */
export interface Unlink {
  readonly op: "unlink";
  readonly structure: Structure;
  readonly relation: string;
}

/** A single graph operation. */
export type GraphOp = Create | Remove | Transform | Link | Unlink;

// ===== Process =====

/**
 * Process — a named composition of graph operations.
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

  /** The graph operations this process performs, in order. */
  readonly ops: readonly GraphOp[];
}

// ===== State =====

/**
 * State — the projection of a node after a process executes.
 *
 * A State is a Structure snapshot with its subtree and links.
 */
export interface State extends Structure {
  /** Child states (subtree projection). */
  readonly children?: readonly State[];

  /** Cross-branch links from this node. */
  readonly links?: readonly { readonly relation: string; readonly target: State }[];
}

// ===== Constructors =====

export const create = (structure: Structure): Create => ({ op: "create", structure });

export const remove = (structure: Structure): Remove => ({ op: "remove", structure });

export const transform = (from: Structure, to: Structure): Transform => ({
  op: "transform",
  from,
  to,
});

export const link = (structure: Structure, relation: string): Link => ({
  op: "link",
  structure,
  relation,
});

export const unlink = (structure: Structure, relation: string): Unlink => ({
  op: "unlink",
  structure,
  relation,
});

export const process = (
  name: string,
  description: string,
  target: Structure,
  ...ops: GraphOp[]
): Process => ({
  name,
  description,
  target,
  ops,
});
