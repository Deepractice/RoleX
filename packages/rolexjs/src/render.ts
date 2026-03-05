/**
 * Render — 3-layer output for all Rolex operations.
 *
 * Layer 1: Status     — what just happened (describe)
 * Layer 2: Hint       — what to do next (hint + cognitive hint)
 * Layer 3: Projection — full state tree as markdown (renderState)
 *
 * render() composes the 3 layers. MCP and CLI are pure pass-through.
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

  // Project
  launch: (n) => `Project "${n}" launched.`,
  scope: (n) => `Scope defined for "${n}".`,
  milestone: (n) => `Milestone "${n}" added.`,
  achieve: (n) => `Milestone "${n}" achieved.`,
  enroll: (n) => `"${n}" enrolled.`,
  remove: (n) => `"${n}" removed.`,
  deliver: (n) => `Deliverable "${n}" added.`,
  wiki: (n) => `Wiki entry "${n}" added.`,
  archive: (n) => `Project "${n}" archived.`,

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

  // Project
  launch: "define scope, add milestones, or enroll members.",
  scope: "add milestones to break down the project.",
  milestone: "enroll members and start working.",
  achieve: "continue with remaining milestones, or archive the project.",
  enroll: "assign milestones and start working.",
  remove: "the individual is no longer a participant.",
  deliver: "deliverable recorded.",
  wiki: "knowledge entry recorded.",
  archive: "the project is archived.",

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

import { directives, processes, world } from "@rolexjs/core";

/** Full Gherkin feature content for a process — sourced from .feature files. */
export function detail(process: string): string {
  return processes[process] ?? "";
}

/** World feature descriptions — framework-level instructions. */
export { world };

// ================================================================
//  Directive — system-level commands at decision points
// ================================================================

/** Get a directive by topic and scenario. Returns empty string if not found. */
export function directive(topic: string, scenario: string): string {
  return directives[topic]?.[scenario] ?? "";
}

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

  // Heading: [name] (id) {origin} #tag [progress]
  const idPart = state.id ? ` (${state.id})` : "";
  const originPart = state.origin ? ` {${state.origin}}` : "";
  const tagPart = state.tag ? ` #${state.tag}` : "";
  const progressPart = state.name === "goal" ? goalProgress(state) : "";
  lines.push(`${heading} [${state.name}]${idPart}${originPart}${tagPart}${progressPart}`);

  // Folded: heading only
  if (options?.fold?.(state)) {
    return lines.join("\n");
  }

  // Body: full information as-is
  if (state.information) {
    lines.push("");
    lines.push(state.information);
  }

  // Links — plan references are compact, organizational links are expanded
  if (state.links && state.links.length > 0) {
    const compactRelations = new Set(["after", "before", "fallback", "fallback-for"]);
    const compact = state.links.filter((l) => compactRelations.has(l.relation));
    const expanded = state.links.filter((l) => !compactRelations.has(l.relation));
    for (const link of compact) {
      const targetId = link.target.id ? ` (${link.target.id})` : "";
      const targetTag = link.target.tag ? ` #${link.target.tag}` : "";
      lines.push(`> ${link.relation}: [${link.target.name}]${targetId}${targetTag}`);
    }
    if (expanded.length > 0) {
      const targets = sortByConceptOrder(expanded.map((l) => l.target));
      for (const target of targets) {
        lines.push("");
        lines.push(renderState(target, depth + 1, options));
      }
    }
  }

  // Children — sorted by concept hierarchy, empty nodes filtered out
  if (state.children && state.children.length > 0) {
    const sorted = sortByConceptOrder(state.children.filter((c) => !isEmpty(c)));
    for (const child of sorted) {
      lines.push("");
      lines.push(renderState(child, depth + 1, options));
    }
  }

  return lines.join("\n");
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
  // Project
  "scope",
  "milestone",
  "deliverable",
  "wiki",
];

/** Summarize plan/task completion for a goal heading. */
function goalProgress(goal: State): string {
  let plans = 0;
  let plansDone = 0;
  let tasks = 0;
  let tasksDone = 0;

  function walk(node: State): void {
    if (node.name === "plan") {
      plans++;
      if (node.tag === "done" || node.tag === "abandoned") plansDone++;
    } else if (node.name === "task") {
      tasks++;
      if (node.tag === "done") tasksDone++;
    }
    for (const child of node.children ?? []) walk(child);
  }

  for (const child of goal.children ?? []) walk(child);
  if (plans === 0 && tasks === 0) return "";
  const parts: string[] = [];
  if (plans > 0) parts.push(`${plansDone}/${plans} plans`);
  if (tasks > 0) parts.push(`${tasksDone}/${tasks} tasks`);
  return ` [${parts.join(", ")}]`;
}

/** A node is empty when it has no id, no information, and no children. */
function isEmpty(node: State): boolean {
  return !node.id && !node.information && (!node.children || node.children.length === 0);
}

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

// ================================================================
//  Render — 3-layer output for tool results
// ================================================================

export interface RenderOptions {
  /** The process that was executed. */
  process: string;
  /** Display name for the primary node. */
  name: string;
  /** State projection of the affected node. */
  state: State;
  /** AI cognitive hint — first-person, state-aware self-direction cue. */
  cognitiveHint?: string | null;
  /** Fold predicate — folded nodes render heading only. */
  fold?: RenderStateOptions["fold"];
}

/** Render a full 3-layer output string. */
export function render(opts: RenderOptions): string {
  const { process, name, state, cognitiveHint, fold } = opts;
  const lines: string[] = [];

  // Layer 1: Status
  lines.push(describe(process, name, state));

  // Layer 2: Hint (static) + Cognitive hint (state-aware)
  lines.push(hint(process));
  if (cognitiveHint) {
    lines.push(`I → ${cognitiveHint}`);
  }

  // Layer 3: Projection — generic markdown rendering of the full state tree
  lines.push("");
  lines.push(renderState(state, 1, fold ? { fold } : undefined));

  return lines.join("\n");
}
