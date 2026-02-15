/**
 * Render — 4-layer output for MCP tool results.
 *
 * Layer 1: Status    — what just happened (describe)
 * Layer 2: Hint      — what to do next (hint)
 * Layer 3: Projection — state tree (subtree visualization)
 * Layer 4: Relations  — cross-branch links (membership, appointment)
 *
 * MCP and CLI share describe() + hint() from rolexjs.
 * Projection + relation rendering lives here (MCP-specific).
 */
import type { State, Structure, Rolex, RolexResult } from "rolexjs";
import { describe, hint, parse } from "rolexjs";

// ================================================================
//  Public API
// ================================================================

export interface RenderOptions {
  /** The process that was executed. */
  process: string;
  /** Display name for the primary node. */
  name: string;
  /** Result from the Rolex API. */
  result: RolexResult;
  /** If provided, discover and render incoming relations. */
  rolex?: Rolex;
  /** The node to discover relations for (usually activeRole). */
  relationsFor?: Structure;
  /** AI cognitive hint — first-person, state-aware self-direction cue. */
  cognitiveHint?: string | null;
}

/** Render a full 4-layer output string. */
export function render(opts: RenderOptions): string {
  const { process, name, result, rolex, relationsFor, cognitiveHint } = opts;
  const lines: string[] = [];

  // Layer 1: Status
  lines.push(describe(process, name, result.state));

  // Layer 2: Hint (static) + Cognitive hint (state-aware)
  lines.push(hint(process));
  if (cognitiveHint) {
    lines.push(`I → ${cognitiveHint}`);
  }

  // Layer 3: Projection
  lines.push("");
  lines.push(renderProjection(result.state));

  // Layer 4: Relations
  if (rolex && relationsFor) {
    const relations = discoverRelations(rolex, relationsFor);
    if (relations.length > 0) {
      lines.push("");
      for (const rel of relations) {
        lines.push(rel);
      }
    }
  }

  return lines.join("\n");
}

// ================================================================
//  Layer 3: Projection — state tree
// ================================================================

function renderProjection(state: State, depth = 0): string {
  const indent = "  ".repeat(depth);
  const info = extractFeatureName(state.information);
  const label = info ? `[${state.name}] ${info}` : `[${state.name}]`;

  const lines = [`${indent}${label}`];

  const children = (state as State & { children?: readonly State[] }).children;
  if (children) {
    for (const child of children) {
      lines.push(renderProjection(child, depth + 1));
    }
  }

  // Outgoing links on this node
  const links = (state as State & { links?: readonly { relation: string; target: State }[] }).links;
  if (links) {
    for (const link of links) {
      const targetName = extractFeatureName(link.target.information) || link.target.name;
      lines.push(`${indent}  ~${link.relation} → ${targetName}`);
    }
  }

  return lines.join("\n");
}

// ================================================================
//  Layer 4: Relations — discover incoming links
// ================================================================

/**
 * Scan society for incoming relations pointing to a node.
 * Returns human-readable relation descriptions.
 */
function discoverRelations(rolex: Rolex, target: Structure): string[] {
  const targetId = target.id;
  if (!targetId) return [];

  const society = rolex.project(rolex.society);
  const results: string[] = [];

  for (const child of societyChildren(society)) {
    if (child.name === "organization") {
      const orgName = extractFeatureName(child.information) || "unnamed org";

      // Check org-level membership links
      for (const link of nodeLinks(child)) {
        if (link.relation === "membership" && link.target.id === targetId) {
          results.push(`membership → ${orgName}`);
        }
      }

      // Check positions within org for appointment links
      for (const orgChild of societyChildren(child)) {
        if (orgChild.name === "position") {
          const posName = extractFeatureName(orgChild.information) || "unnamed position";
          for (const link of nodeLinks(orgChild)) {
            if (link.relation === "appointment" && link.target.id === targetId) {
              results.push(`appointment → ${posName} @ ${orgName}`);
            }
          }
        }
      }
    }
  }

  return results;
}

// ================================================================
//  Helpers
// ================================================================

function extractFeatureName(information?: string): string | null {
  if (!information) return null;
  try {
    return parse(information).name;
  } catch {
    // Fallback: try to extract "Feature: <name>" manually
    const match = information.match(/^Feature:\s*(.+)/m);
    return match ? match[1].trim() : null;
  }
}

function societyChildren(state: State): readonly State[] {
  return (state as State & { children?: readonly State[] }).children ?? [];
}

function nodeLinks(state: State): readonly { relation: string; target: State }[] {
  return (state as State & { links?: readonly { relation: string; target: State }[] }).links ?? [];
}
