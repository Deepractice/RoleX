/**
 * Find — unified node lookup with priority-based disambiguation.
 *
 * When multiple nodes share the same id (allowed after relaxing
 * global uniqueness), prefer "addressable" nodes over internal metadata.
 *
 * Priority (lower = preferred):
 *   0: individual, organization, position   — top-level entities
 *   1: goal                                  — execution roots
 *   2: plan, task                            — execution nodes
 *   3: procedure, principle                  — individual knowledge
 *   4: encounter, experience                 — cognition artifacts
 *   5: identity, charter                     — structural definitions
 *   6: duty, requirement, background, etc.   — internal metadata
 */
import type { State, Structure } from "@rolexjs/system";

const PRIORITY: Record<string, number> = {
  individual: 0,
  organization: 0,
  position: 0,
  goal: 1,
  plan: 2,
  task: 2,
  procedure: 3,
  principle: 3,
  encounter: 4,
  experience: 4,
  identity: 5,
  charter: 5,
  duty: 6,
  requirement: 6,
  background: 6,
  tone: 6,
  mindset: 6,
};

function priorityOf(name: string): number {
  return PRIORITY[name] ?? 7;
}

function matches(node: State, target: string): boolean {
  if (node.id?.toLowerCase() === target) return true;
  if (node.alias) {
    for (const a of node.alias) {
      if (a.toLowerCase() === target) return true;
    }
  }
  return false;
}

/**
 * Find a node by id or alias in a state tree.
 *
 * When multiple nodes match, returns the one with the highest priority
 * (top-level entities > execution nodes > knowledge > metadata).
 */
export function findInState(state: State, target: string): Structure | null {
  const lowered = target.toLowerCase();
  let best: Structure | null = null;
  let bestPriority = Infinity;

  function walk(node: State): void {
    if (matches(node, lowered)) {
      const p = priorityOf(node.name);
      if (p < bestPriority) {
        best = node;
        bestPriority = p;
        if (p === 0) return;
      }
    }
    for (const child of node.children ?? []) {
      walk(child);
      if (bestPriority === 0) return;
    }
  }

  walk(state);
  return best;
}
