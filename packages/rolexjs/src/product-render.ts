/**
 * Product Render — format product state as readable text.
 *
 * Renders product operations into human-readable summaries.
 * Ownership links show owner names only (not full individual trees).
 * Specs show behavior contract titles for quick overview.
 */
import type { State } from "@rolexjs/system";
import { describe, hint } from "./render.js";

// ================================================================
//  Types
// ================================================================

export type ProductAction =
  | "create"
  | "strategy"
  | "spec"
  | "release"
  | "channel"
  | "own"
  | "disown"
  | "deprecate";

// ================================================================
//  Product Overview
// ================================================================

export function renderProduct(state: State): string {
  const lines: string[] = [];
  const id = state.id ?? "(no id)";
  const tag = state.tag ? ` #${state.tag}` : "";

  // Title
  lines.push(`# ${id}${tag}`);

  // Feature body (vision)
  if (state.information) {
    lines.push("");
    lines.push(state.information);
  }

  // Owners (ownership links — compact)
  const owners = state.links?.filter((l) => l.relation === "ownership") ?? [];
  if (owners.length > 0) {
    lines.push("");
    lines.push("## Owner");
    for (const o of owners) {
      const alias = o.target.alias?.length ? ` (${o.target.alias.join(", ")})` : "";
      lines.push(`- ${o.target.id ?? "(no id)"}${alias}`);
    }
  }

  // Children by type
  const children = state.children ?? [];

  const strategies = children.filter((c) => c.name === "strategy");
  const specs = children.filter((c) => c.name === "spec");
  const releases = children.filter((c) => c.name === "release");
  const channels = children.filter((c) => c.name === "channel");

  if (strategies.length > 0) {
    lines.push("");
    lines.push("## Strategy");
    for (const s of strategies) {
      if (s.information) lines.push(s.information);
    }
  }

  if (specs.length > 0) {
    lines.push("");
    lines.push("## Specs");
    for (const s of specs) {
      const title = s.id ?? extractFeatureTitle(s.information);
      lines.push(`- ${title}`);
    }
  }

  if (releases.length > 0) {
    lines.push("");
    lines.push("## Releases");
    for (const r of releases) {
      const tag = r.tag ? ` #${r.tag}` : "";
      const title = r.id ?? extractFeatureTitle(r.information);
      lines.push(`- ${title}${tag}`);
    }
  }

  if (channels.length > 0) {
    lines.push("");
    lines.push("## Channels");
    for (const c of channels) {
      const title = c.id ?? extractFeatureTitle(c.information);
      lines.push(`- ${title}`);
    }
  }

  return lines.join("\n");
}

// ================================================================
//  Compose — main entry point
// ================================================================

/**
 * Render a product operation result as readable text.
 * Returns status + hint + product overview.
 */
export function renderProductResult(action: ProductAction, state: State): string {
  const name = state.id ?? state.name;
  const lines: string[] = [];

  // Layer 1: Status
  lines.push(describe(action, name, state));

  // Layer 2: Hint
  lines.push(hint(action));

  // Layer 3: Product overview
  const productState = isProductNode(state) ? state : null;
  if (productState) {
    lines.push("");
    lines.push(renderProduct(productState));
  }

  return lines.join("\n");
}

// ================================================================
//  Helpers
// ================================================================

function isProductNode(state: State): boolean {
  return state.name === "product";
}

function extractFeatureTitle(information?: string | null): string {
  if (!information) return "(untitled)";
  const match = information.match(/^Feature:\s*(.+)$/m);
  return match?.[1]?.trim() ?? information.split("\n")[0].trim();
}
