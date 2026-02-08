/**
 * Scenario — A unit of behavior within a Feature.
 *
 * Extends Gherkin's Scenario with verifiability marking.
 * Verifiable scenarios become persistent test cases.
 * Non-verifiable scenarios are one-time acceptance criteria.
 */

import type { Scenario as GherkinScenario } from "@cucumber/messages";

/**
 * A Gherkin Scenario enriched with verification metadata.
 */
export interface Scenario extends GherkinScenario {
  readonly verifiable: boolean;
}
