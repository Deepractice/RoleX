/**
 * Project Render — format project state as readable text.
 *
 * Renders project operations into human-readable summaries.
 * Participation links show member names only (not full individual trees).
 * Milestones show progress status (#done or pending).
 */
import type { State } from "@rolexjs/system";
import { describe, hint } from "./render.js";

// ================================================================
//  Types
// ================================================================

export type ProjectAction =
  | "launch"
  | "scope"
  | "milestone"
  | "achieve"
  | "enroll"
  | "remove"
  | "deliver"
  | "wiki"
  | "archive";

// ================================================================
//  Project Overview
// ================================================================

export function renderProject(state: State): string {
  const lines: string[] = [];
  const id = state.id ?? "(no id)";
  const tag = state.tag ? ` #${state.tag}` : "";

  // Title
  lines.push(`# ${id}${tag}`);

  // Feature body
  if (state.information) {
    lines.push("");
    lines.push(state.information);
  }

  // Members (participation links — compact)
  const members = state.links?.filter((l) => l.relation === "participation") ?? [];
  if (members.length > 0) {
    lines.push("");
    lines.push("## Members");
    for (const m of members) {
      const alias = m.target.alias?.length ? ` (${m.target.alias.join(", ")})` : "";
      lines.push(`- ${m.target.id ?? "(no id)"}${alias}`);
    }
  }

  // Children by type
  const children = state.children ?? [];

  const scopes = children.filter((c) => c.name === "scope");
  const milestones = children.filter((c) => c.name === "milestone");
  const deliverables = children.filter((c) => c.name === "deliverable");
  const wikis = children.filter((c) => c.name === "wiki");

  if (scopes.length > 0) {
    lines.push("");
    lines.push("## Scope");
    for (const s of scopes) {
      if (s.information) lines.push(s.information);
    }
  }

  if (milestones.length > 0) {
    lines.push("");
    lines.push("## Milestones");
    for (const m of milestones) {
      const tag = m.tag ? ` #${m.tag}` : "";
      const marker = m.tag === "done" ? "[x]" : "[ ]";
      const title = extractFeatureTitle(m.information);
      lines.push(`- ${marker} ${m.id ?? title}${tag}`);
      if (m.information && m.id) {
        const desc = extractFeatureTitle(m.information);
        if (desc && desc !== m.id) lines.push(`  ${desc}`);
      }
    }
  }

  if (deliverables.length > 0) {
    lines.push("");
    lines.push("## Deliverables");
    for (const d of deliverables) {
      const title = d.id ?? extractFeatureTitle(d.information);
      lines.push(`- ${title}`);
    }
  }

  if (wikis.length > 0) {
    lines.push("");
    lines.push("## Wiki");
    for (const w of wikis) {
      const title = w.id ?? extractFeatureTitle(w.information);
      lines.push(`- ${title}`);
    }
  }

  return lines.join("\n");
}

// ================================================================
//  Compose — main entry point
// ================================================================

/**
 * Render a project operation result as readable text.
 * Returns status + hint + project overview.
 */
export function renderProjectResult(action: ProjectAction, state: State): string {
  const name = state.id ?? state.name;
  const lines: string[] = [];

  // Layer 1: Status
  lines.push(describe(action, name, state));

  // Layer 2: Hint
  lines.push(hint(action));

  // Layer 3: Project overview
  // For child operations (scope, milestone, etc.), find the project parent
  const projectState = isProjectNode(state) ? state : null;
  if (projectState) {
    lines.push("");
    lines.push(renderProject(projectState));
  }

  return lines.join("\n");
}

// ================================================================
//  Helpers
// ================================================================

function isProjectNode(state: State): boolean {
  return state.name === "project";
}

function extractFeatureTitle(information?: string | null): string {
  if (!information) return "(untitled)";
  const match = information.match(/^Feature:\s*(.+)$/m);
  return match?.[1]?.trim() ?? information.split("\n")[0].trim();
}
