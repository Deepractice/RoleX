/**
 * render.ts — Unified rendering layer for Rolex output.
 *
 * Converts Feature objects back to Gherkin text.
 * Used by both MCP server and CLI for consistent output.
 */

import type { Feature } from "@rolexjs/core";

/**
 * Render a single Feature as Gherkin text.
 */
export function renderFeature(feature: Feature): string {
  const lines: string[] = [];

  // Tags
  if (feature.tags && feature.tags.length > 0) {
    lines.push(feature.tags.map((t) => t.name).join(" "));
  }

  // Feature header
  lines.push(`Feature: ${feature.name}`);

  // Description
  if (feature.description?.trim()) {
    for (const line of feature.description.split("\n")) {
      lines.push(`  ${line.trimEnd()}`);
    }
  }

  // Scenarios
  for (const scenario of feature.scenarios) {
    lines.push("");

    // Scenario tags
    if (scenario.tags && scenario.tags.length > 0) {
      lines.push(`  ${scenario.tags.map((t) => t.name).join(" ")}`);
    }

    lines.push(`  Scenario: ${scenario.name}`);

    for (const step of scenario.steps) {
      lines.push(`    ${step.keyword}${step.text}`);
    }
  }

  return lines.join("\n");
}

/**
 * Render multiple Features as Gherkin text, separated by blank lines.
 */
export function renderFeatures(features: Feature[]): string {
  return features.map(renderFeature).join("\n\n");
}
