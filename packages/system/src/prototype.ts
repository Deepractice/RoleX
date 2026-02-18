/**
 * Prototype — a source of base State trees for merging.
 *
 * A prototype provides a pre-configured State tree (template) that gets
 * merged with an instance State via mergeState.
 *
 * Matching is by id: if prototype and instance share the same id,
 * they are the same entity — prototype provides the base,
 * instance provides the overlay.
 *
 * activate(id) = mergeState(prototype.resolve(id), runtime.project(id))
 */
import type { State } from "./process.js";

// ===== Prototype interface =====

/** A source that resolves prototype State trees by id. */
export interface Prototype {
  /** Resolve a prototype State by id. Returns undefined if no prototype exists. */
  resolve(id: string): State | undefined;
}

// ===== In-memory implementation =====

/** Create an in-memory prototype source. */
export const createPrototype = (): Prototype & {
  /** Register a State tree as a prototype (keyed by state.id). */
  register(state: State): void;
} => {
  const prototypes = new Map<string, State>();

  return {
    resolve(id) {
      return prototypes.get(id);
    },

    register(state) {
      if (!state.id) {
        throw new Error("Prototype state must have an id");
      }
      prototypes.set(state.id, state);
    },
  };
};
