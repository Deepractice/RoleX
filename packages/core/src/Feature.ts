/**
 * Feature — The atomic unit in the RDD model.
 *
 * Extends Gherkin's Feature with RDD dimension classification
 * and explicit Scenario relationship.
 */

import type { Feature as GherkinFeature } from "@cucumber/messages";
import type { Scenario } from "./Scenario.js";

/**
 * A Gherkin Feature enriched with RDD semantics.
 */
export interface Feature extends GherkinFeature {
  readonly type:
    | "persona"
    | "knowledge"
    | "experience"
    | "voice"
    | "goal"
    | "plan"
    | "task"
    | "duty"
    | "skill";
  readonly scenarios: Scenario[];
}
