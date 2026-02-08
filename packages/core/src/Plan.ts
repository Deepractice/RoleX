/**
 * Plan — The bridge between goal and execution.
 *
 * A Plan IS-A Feature with type='plan'.
 * Expressed as *.plan.feature files.
 */

import type { Feature } from "./Feature.js";

/**
 * A plan that decomposes a goal into executable tasks.
 */
export interface Plan extends Feature {
  readonly type: "plan";
}
