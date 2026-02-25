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

/** A source that manages and resolves prototype State trees by id. */
export interface Prototype {
  /** Resolve a prototype State by id. Returns undefined if no prototype exists. */
  resolve(id: string): Promise<State | undefined>;

  /** Settle: register a prototype — bind id to a source (path or locator). */
  settle(id: string, source: string): void;

  /** Evict: unregister a prototype by id. */
  evict(id: string): void;

  /** List all registered prototypes: id → source mapping. */
  list(): Record<string, string>;
}

// ===== In-memory implementation =====

/** Create an in-memory prototype (for tests). */
export const createPrototype = (): Prototype & {
  /** Seed a State directly for testing (bypasses source resolution). */
  seed(state: State): void;
} => {
  const states = new Map<string, State>();
  const sources = new Map<string, string>();

  return {
    async resolve(id) {
      return states.get(id);
    },

    settle(id, source) {
      sources.set(id, source);
    },

    evict(id) {
      sources.delete(id);
      states.delete(id);
    },

    list() {
      return Object.fromEntries(sources);
    },

    seed(state) {
      if (!state.id) {
        throw new Error("Prototype state must have an id");
      }
      states.set(state.id, state);
    },
  };
};
