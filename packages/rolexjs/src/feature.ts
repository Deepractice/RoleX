/**
 * Feature — the information format for the RoleX concept world.
 *
 * Every node's information is a Gherkin Feature.
 * This is our own type — decoupled from @cucumber/messages.
 */

export interface Feature {
  readonly name: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly scenarios: readonly Scenario[];
}

export interface Scenario {
  readonly name: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly steps: readonly Step[];
}

export interface Step {
  readonly keyword: string;
  readonly text: string;
  readonly dataTable?: readonly DataTableRow[];
}

export interface DataTableRow {
  readonly cells: readonly string[];
}

// ================================================================
//  Parse + Serialize
// ================================================================

import { parse as parseGherkin } from "@rolexjs/parser";

/** Parse a Gherkin source string into a Feature. */
export function parse(source: string): Feature {
  const doc = parseGherkin(source);
  const f = doc.feature;
  if (!f) throw new Error("No Feature found in source");

  return {
    name: f.name,
    ...(f.description?.trim() ? { description: f.description.trim() } : {}),
    ...(f.tags?.length ? { tags: f.tags.map((t) => t.name) } : {}),
    scenarios: (f.children ?? [])
      .filter((c) => c.scenario)
      .map((c) => {
        const s = c.scenario!;
        return {
          name: s.name,
          ...(s.description?.trim() ? { description: s.description.trim() } : {}),
          ...(s.tags?.length ? { tags: s.tags.map((t) => t.name) } : {}),
          steps: (s.steps ?? []).map((st) => ({
            keyword: st.keyword,
            text: st.text,
            ...(st.dataTable
              ? {
                  dataTable: st.dataTable.rows.map((r) => ({
                    cells: r.cells.map((c) => c.value),
                  })),
                }
              : {}),
          })),
        };
      }),
  };
}

/** Serialize a Feature back to Gherkin source string. */
export function serialize(feature: Feature): string {
  const lines: string[] = [];

  if (feature.tags?.length) {
    lines.push(feature.tags.join(" "));
  }
  lines.push(`Feature: ${feature.name}`);
  if (feature.description) {
    for (const line of feature.description.split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  for (const scenario of feature.scenarios) {
    lines.push("");
    if (scenario.tags?.length) {
      lines.push(`  ${scenario.tags.join(" ")}`);
    }
    lines.push(`  Scenario: ${scenario.name}`);
    if (scenario.description) {
      for (const line of scenario.description.split("\n")) {
        lines.push(`    ${line}`);
      }
    }
    for (const step of scenario.steps) {
      lines.push(`    ${step.keyword}${step.text}`);
      if (step.dataTable) {
        for (const row of step.dataTable) {
          lines.push(`      | ${row.cells.join(" | ")} |`);
        }
      }
    }
  }

  return lines.join("\n") + "\n";
}
