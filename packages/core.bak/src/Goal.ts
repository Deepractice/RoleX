/**
 * Goal — The driver of action.
 *
 * A Goal IS-A Feature with type='goal'.
 * Dynamic and phase-specific. What the role wants to achieve.
 * Expressed as *.goal.feature files.
 */

import type { Feature } from "./Feature.js";

/**
 * A goal that a role wants to achieve in a given phase.
 */
export interface Goal extends Feature {
  readonly type: "goal";
}
