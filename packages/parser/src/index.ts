/**
 * @rolexjs/parser
 *
 * Gherkin parser for Rolex — wraps @cucumber/gherkin.
 * Re-exports Gherkin document types and provides a simple parse() function.
 *
 * Own the interface, delegate the implementation.
 */

import { Parser, AstBuilder, GherkinClassicTokenMatcher } from "@cucumber/gherkin";
import { IdGenerator } from "@cucumber/messages";
import type { GherkinDocument } from "@cucumber/messages";

// ========== Re-export Gherkin Document Types ==========

export type {
  GherkinDocument,
  Feature,
  Scenario,
  Step,
  DataTable,
  DocString,
  TableRow,
  TableCell,
  Tag,
  Comment,
  Location,
  Background,
  Rule,
  RuleChild,
  FeatureChild,
  Examples,
} from "@cucumber/messages";

export { StepKeywordType } from "@cucumber/messages";

// ========== Parse Function ==========

/**
 * Parse a Gherkin source string into a GherkinDocument.
 *
 * @param source - Raw Gherkin text content
 * @returns Parsed GherkinDocument with Feature, Scenarios, Steps, etc.
 *
 * @example
 * ```typescript
 * import { parse } from "@rolexjs/parser";
 *
 * const doc = parse(`
 *   Feature: My Feature
 *     Scenario: My Scenario
 *       Given a precondition
 *       When an action
 *       Then an outcome
 * `);
 *
 * console.log(doc.feature?.name); // "My Feature"
 * ```
 */
export function parse(source: string): GherkinDocument {
  const builder = new AstBuilder(IdGenerator.incrementing());
  const matcher = new GherkinClassicTokenMatcher();
  const parser = new Parser(builder, matcher);
  return parser.parse(source);
}
