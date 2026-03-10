/**
 * Projection — the single projection pipeline for RoleX.
 *
 * Pipeline: raw project → compact(depth) → enrich permissions.
 *
 * All projections go through this pipeline. No special cases.
 * Control behavior via ProjectionContext.
 *
 * Rules:
 *   - Root (depth 0): full
 *   - Level 1 children: full (with content)
 *   - Level 2+ grandchildren: compact (name/id/tag only, no subtree)
 *   - Reverse links: compact immediately
 *   - Forward links: keep children but strip nested links
 */

import type { Runtime, State, Structure } from "@rolexjs/system";
import type { PermissionRegistry } from "./permissions/registry.js";

// ================================================================
//  ProjectionContext — controls projection behavior
// ================================================================

export interface ProjectionContext {
  /** Children expansion depth. Default 1: one level fully expanded, then compact. */
  depth?: number;
}

const DEFAULT_DEPTH = 1;

// ================================================================
//  Projection — the unified entry point
// ================================================================

export interface Projection {
  /** Project a node through the full pipeline: raw → compact → enrich. */
  (node: Structure, ctx?: ProjectionContext): Promise<State>;
}

/** Create the projection pipeline wired to a runtime and permission registry. */
export function createProjection(rt: Runtime, permissions: PermissionRegistry): Projection {
  return async (node: Structure, ctx?: ProjectionContext): Promise<State> => {
    const raw = await rt.project(node);
    const compacted = compactState(raw, ctx?.depth ?? DEFAULT_DEPTH);
    return permissions.enrich(compacted);
  };
}

// ================================================================
//  Compact — internal implementation
// ================================================================

/**
 * Reverse relations — link targets are rendered as compact references (no subtree).
 * These are relations where the individual "points back" to a parent entity
 * (society, org, project, product), and expanding the full subtree would be
 * redundant or explosive.
 */
const compactRelations = new Set([
  "crowned",
  "belong",
  "appointment",
  "administer",
  "maintained-by",
  "own",
]);

/** Strip a State to just the node — no children, no links. */
function compact(state: State): State {
  const { children, links, ...node } = state;
  return node;
}

/** Apply depth control + link compacting. */
function compactState(state: State, depth: number): State {
  const children =
    depth > 0
      ? state.children?.map((c) => compactState(c, depth - 1))
      : state.children?.map((c) => compact(c));

  const compactedLinks = state.links?.map((l) =>
    compactRelations.has(l.relation)
      ? { ...l, target: compact(l.target) }
      : { ...l, target: compactLinkedTarget(l.target) }
  );

  return {
    ...state,
    ...(children ? { children } : {}),
    ...(compactedLinks ? { links: compactedLinks } : {}),
  };
}

/** For non-compact links, keep children but don't recurse into further links. */
function compactLinkedTarget(state: State): State {
  const children = state.children?.map((c) => compactLinkedTarget(c));
  return {
    ...state,
    ...(children ? { children } : {}),
  };
}
