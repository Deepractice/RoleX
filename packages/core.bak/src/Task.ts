/**
 * Task — Concrete unit of work within a plan.
 *
 * A Task IS-A Feature with type='task'.
 * Expressed as *.task.feature files.
 */

import type { Feature } from "./Feature.js";

/**
 * A concrete unit of work.
 */
export interface Task extends Feature {
  readonly type: "task";
}
