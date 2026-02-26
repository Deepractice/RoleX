/**
 * Render — description + hint templates for every process.
 *
 * Each operation produces two pieces of text:
 *   description — what just happened (past tense)
 *   hint        — what to do next (suggestion)
 *
 * These are shared by MCP and CLI. The I/O layer just presents them.
 */
import type { State } from "@rolexjs/system";

// ================================================================
//  Description — what happened
// ================================================================

const descriptions: Record<string, (name: string, state: State) => string> = {
  // Lifecycle
  born: (n) => `Individual "${n}" is born.`,
  found: (n) => `Organization "${n}" is founded.`,
  establish: (n) => `Position "${n}" is established.`,
  charter: (n) => `Charter defined for "${n}".`,
  charge: (n) => `Duty "${n}" assigned.`,
  retire: (n) => `"${n}" retired.`,
  die: (n) => `"${n}" is gone.`,
  dissolve: (n) => `Organization "${n}" dissolved.`,
  abolish: (n) => `Position "${n}" abolished.`,
  rehire: (n) => `"${n}" is back.`,

  // Organization
  hire: (n) => `"${n}" hired.`,
  fire: (n) => `"${n}" fired.`,
  appoint: (n) => `"${n}" appointed.`,
  dismiss: (n) => `"${n}" dismissed.`,

  // Role
  activate: (n) => `Role "${n}" activated.`,
  focus: (n) => `Focused on goal "${n}".`,

  // Execution
  want: (n) => `Goal "${n}" declared.`,
  plan: (n) => `Plan created for "${n}".`,
  todo: (n) => `Task "${n}" added.`,
  finish: (n) => `Task "${n}" finished → encounter recorded.`,
  complete: (n) => `Plan "${n}" completed → encounter recorded.`,
  abandon: (n) => `Plan "${n}" abandoned → encounter recorded.`,

  // Cognition
  reflect: (n) => `Reflected on "${n}" → experience gained.`,
  realize: (n) => `Realized principle from "${n}".`,
  master: (n) => `Mastered procedure from "${n}".`,

  // Knowledge management
  forget: (n) => `"${n}" forgotten.`,
};

export function describe(process: string, name: string, state: State): string {
  const fn = descriptions[process];
  return fn ? fn(name, state) : `${process} completed.`;
}

// ================================================================
//  Hint — what to do next
// ================================================================

const hints: Record<string, string> = {
  // Lifecycle
  born: "hire into an organization, or activate to start working.",
  found: "define a charter for the organization.",
  establish: "charge with duties, then appoint members.",
  charter: "establish positions for the organization.",
  charge: "appoint someone to this position.",
  retire: "rehire if needed later.",
  die: "this individual is permanently gone.",
  dissolve: "the organization no longer exists.",
  abolish: "the position no longer exists.",
  rehire: "activate to resume working.",

  // Organization
  hire: "appoint to a position, or activate to start working.",
  fire: "the individual is no longer a member.",
  appoint: "the individual now holds this position.",
  dismiss: "the position is now vacant.",

  // Role
  activate: "want a goal, or check the current state.",
  focus: "plan how to work toward it, or add tasks.",

  // Execution
  want: "plan how to work toward it.",
  plan: "add tasks with todo.",
  todo: "start working, finish when done.",
  finish: "continue with remaining tasks, or complete the plan.",
  complete: "reflect on encounters to gain experience.",
  abandon: "reflect on encounters to learn from the experience.",

  // Cognition
  reflect: "realize principles or master procedures from experience.",
  realize: "principle added.",
  master: "procedure added.",

  // Knowledge management
  forget: "the node has been removed.",
};

export function hint(process: string): string {
  const h = hints[process];
  return h ? `Next: ${h}` : "What would you like to do next?";
}

// ================================================================
//  Detail — longer process descriptions (from .feature files)
// ================================================================

import { processes, world } from "@rolexjs/prototype";

/** Full Gherkin feature content for a process — sourced from .feature files. */
export function detail(process: string): string {
  return processes[process] ?? "";
}

/** World feature descriptions — framework-level instructions. */
export { world };

// ================================================================
//  Generic State renderer — renders any State tree as markdown
// ================================================================

/**
 * renderState — markdown renderer for State trees.
 *
 * Rules:
 *   - Heading: "#" repeated to depth + " [name]"
 *   - Body: raw information field as-is (full Gherkin preserved)
 *   - Links: "> → relation [target.name]" with target feature name
 *   - Children: sorted by concept hierarchy, then rendered at depth+1
 *   - Fold: when fold(node) returns true, render heading only (no body/links/children)
 *
 * Markdown heading depth caps at 6 (######).
 */
export interface RenderStateOptions {
  /** When returns true, render only the heading — skip body, links, and children. */
  fold?: (node: State) => boolean;
}

export function renderState(state: State, depth = 1, options?: RenderStateOptions): string {
  const lines: string[] = [];
  const level = Math.min(depth, 6);
  const heading = "#".repeat(level);

  // Heading: [name] (id) {origin} #tag
  const idPart = state.id ? ` (${state.id})` : "";
  const originPart = state.origin ? ` {${state.origin}}` : "";
  const tagPart = state.tag ? ` #${state.tag}` : "";
  lines.push(`${heading} [${state.name}]${idPart}${originPart}${tagPart}`);

  // Folded: heading only
  if (options?.fold?.(state)) {
    return lines.join("\n");
  }

  // Body: full information as-is
  if (state.information) {
    lines.push("");
    lines.push(state.information);
  }

  // Links
  if (state.links && state.links.length > 0) {
    lines.push("");
    for (const link of state.links) {
      const targetLabel = extractLabel(link.target);
      lines.push(`> ${link.relation} → ${targetLabel}`);
    }
  }

  // Children — sorted by concept hierarchy
  if (state.children && state.children.length > 0) {
    const sorted = sortByConceptOrder(state.children);
    for (const child of sorted) {
      lines.push("");
      lines.push(renderState(child, depth + 1, options));
    }
  }

  return lines.join("\n");
}

/** Extract a display label from a State: "[name] FeatureTitle" or just "[name]". */
function extractLabel(state: State): string {
  if (!state.information) return `[${state.name}]`;
  const match = state.information.match(/^Feature:\s*(.+)/m);
  const title = match ? match[1].trim() : state.information.split("\n")[0].trim();
  return `[${state.name}] ${title}`;
}

// ================================================================
//  Concept ordering — children sorted by structure hierarchy
// ================================================================

/** Concept tree order: identity → cognition → knowledge → execution → organization. */
const CONCEPT_ORDER: readonly string[] = [
  // Individual — Identity
  "identity",
  "background",
  "tone",
  "mindset",
  // Individual — Cognition
  "encounter",
  "experience",
  // Individual — Knowledge
  "principle",
  "procedure",
  // Individual — Execution
  "goal",
  "plan",
  "task",
  // Organization
  "charter",
  // Position
  "position",
  "duty",
];

/** Sort children by concept hierarchy order. Unknown names go to the end, preserving relative order. */
function sortByConceptOrder(children: readonly State[]): readonly State[] {
  return [...children].sort((a, b) => {
    const ai = CONCEPT_ORDER.indexOf(a.name);
    const bi = CONCEPT_ORDER.indexOf(b.name);
    const aOrder = ai >= 0 ? ai : CONCEPT_ORDER.length;
    const bOrder = bi >= 0 ? bi : CONCEPT_ORDER.length;
    return aOrder - bOrder;
  });
}
