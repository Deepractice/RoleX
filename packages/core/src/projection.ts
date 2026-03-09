/**
 * Projection — post-processing for projected state trees.
 *
 * Runtime.project() returns raw trees with fully expanded links.
 * This module applies business-level transformations:
 *   - compactRelations: trim reverse-relation link targets to node-only (no subtree)
 *
 * Lives in core, not in platform, so all runtimes get consistent behavior.
 */

import type { State } from "@rolexjs/system";

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

/** Recursively apply compactRelations to a projected state tree. */
export function compactState(state: State): State {
  const children = state.children?.map((c) => compactState(c));
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
