/**
 * Duty — Responsibilities defined by a Position.
 *
 * A Duty IS-A Feature with type='duty'.
 * Expressed as *.duty.feature files within a position directory.
 * Injected into role identity when the role is on_duty.
 */

import type { Feature } from "./Feature.js";

/**
 * A duty (responsibility) assigned through a position.
 */
export interface Duty extends Feature {
  readonly type: "duty";
}
