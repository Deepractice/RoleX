/**
 * transitions.ts — State machine definitions and transition logic.
 *
 * Role transitions:
 *   free --(hire)--> member --(appoint)--> on_duty
 *   on_duty --(dismiss)--> member --(fire)--> free
 *   on_duty --(fire)--> free  (auto-dismiss)
 *
 * Position transitions:
 *   vacant --(appoint)--> filled --(dismiss)--> vacant
 */

import type { RoleState, PositionState } from "./states.js";

export interface Transition<S extends string> {
  readonly from: S;
  readonly to: S;
  readonly action: string;
}

export const ROLE_MACHINE: Transition<RoleState>[] = [
  { from: "free", to: "member", action: "hire" },
  { from: "member", to: "on_duty", action: "appoint" },
  { from: "on_duty", to: "member", action: "dismiss" },
  { from: "member", to: "free", action: "fire" },
  { from: "on_duty", to: "free", action: "fire" },
];

export const POSITION_MACHINE: Transition<PositionState>[] = [
  { from: "vacant", to: "filled", action: "appoint" },
  { from: "filled", to: "vacant", action: "dismiss" },
];

/**
 * Find a transition by current state and action.
 */
export function findTransition<S extends string>(
  machine: Transition<S>[],
  from: S,
  action: string
): Transition<S> | null {
  return machine.find((t) => t.from === from && t.action === action) ?? null;
}

/**
 * Check if a transition is valid.
 */
export function canTransition<S extends string>(
  machine: Transition<S>[],
  from: S,
  action: string
): boolean {
  return findTransition(machine, from, action) !== null;
}

/**
 * Execute a transition — returns new state or throws.
 */
export function transition<S extends string>(machine: Transition<S>[], from: S, action: string): S {
  const t = findTransition(machine, from, action);
  if (!t) {
    throw new Error(`Invalid transition: cannot "${action}" from state "${from}"`);
  }
  return t.to;
}
