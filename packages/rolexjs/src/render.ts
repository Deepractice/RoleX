/**
 * render.ts — Unified rendering layer for Rolex output.
 *
 * Converts Feature objects back to Gherkin text.
 * Used by both MCP server and CLI for consistent output.
 */

import type { Feature, Goal } from "@rolexjs/core";

/**
 * Render a single Feature as Gherkin text.
 */
export function renderFeature(feature: Feature): string {
  const lines: string[] = [];

  // Type comment
  if (feature.type) {
    lines.push(`# type: ${feature.type}`);
  }

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

/**
 * Render a status bar showing current role, goal, and time.
 */
export function renderStatusBar(roleName: string, currentGoal: Goal | null): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const goal = currentGoal ? currentGoal.name : "none";
  return `[${roleName}] goal: ${goal} | ${now}`;
}

// ========== Workflow Hints ==========

/** Append a workflow hint to output. */
export function next(result: string, hint: string): string {
  return `${result}\n\n**Next**: ${hint}`;
}

/** Static workflow hints — keyed by operation name. */
export const NEXT: Record<string, string> = {
  born: "`teach` to add knowledge, or `hire` to bring into organization.",
  found: "`born` to create roles for this organization.",
  teach: "`teach` more knowledge, or `hire` to bring into organization.",
  fire: "Role identity remains intact. `hire` to re-hire, or `directory` to see current state.",
  growup: "`focus()` to check current goal, or continue working.",
  want: "`plan` to design how to achieve it, or `todo` to create tasks directly.",
  plan: "`todo` to break the plan into concrete tasks.",
  todo: "Execute the task, then `finish(name)` when done.",
  achieve: "`focus()` to see the next goal.",
  abandon: "`focus()` to see the next goal.",
  reflect: "`identity(roleId)` to see updated knowledge.",
};

/** Dynamic hint for hire — includes the role name. */
export function nextHire(name: string): string {
  return `\`identity("${name}")\` to activate the role.`;
}

/** Dynamic hint for finish — checks remaining task count. */
export function nextFinish(remainingTasks: number): string {
  if (remainingTasks === 0) {
    return "All tasks done! Use `achieve()` to complete the goal.";
  }
  return `${remainingTasks} task(s) remaining.`;
}

// ========== Error Rendering ==========

const HINTS: Array<[RegExp, string]> = [
  [/No active role/, "Call `identity(roleId)` first to activate a role."],
  [
    /No active goal/,
    "Use `want()` to create a goal, or `focus(name)` to switch to an existing one.",
  ],
  [/Role not found/, 'Create the role first with `society(operation: "born")`.'],
  [/not hired/, 'Hire the role first with `organization(operation: "hire")`.'],
  [/Goal not found/, "Check the goal name, or use `focus()` to see active goals."],
  [/Task not found/, "Check the task name. Use `focus()` to see current tasks."],
  [
    /Experience not found/,
    "Check the experience name. Use `identity(roleId)` to see all identity files.",
  ],
  [
    /Not found in society/,
    'Check the name. Use `society(operation: "directory")` to list all roles and organizations.',
  ],
  [/No rolex\.json/, 'Initialize the organization first with `society(operation: "found")`.'],
  [/requires:/, "Check the required parameters for this operation."],
];

function getHint(message: string): string | null {
  for (const [pattern, hint] of HINTS) {
    if (pattern.test(message)) return hint;
  }
  return null;
}

/**
 * Render an error as a formatted markdown block.
 *
 * Format:
 *   **Error** | `tool_name`
 *   > error message
 *   **Hint**: actionable suggestion
 */
export function renderError(tool: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const hint = getHint(message);
  const lines = [`**Error** | \`${tool}\``, "", `> ${message}`];
  if (hint) {
    lines.push("", `**Hint**: ${hint}`);
  }
  return lines.join("\n");
}
