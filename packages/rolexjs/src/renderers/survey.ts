/**
 * SurveyRenderer — Markdown rendering for survey.* commands.
 *
 * Renders the organization-centric tree view:
 * orgs → projects + members (with positions) → unaffiliated individuals.
 */

import type { CommandResult } from "@rolexjs/core";
import type { State } from "@rolexjs/system";
import type { Renderer } from "./renderer.js";

export class SurveyRenderer implements Renderer {
  render(_command: string, result: CommandResult): string {
    const children = result.state.children ?? [];

    if (children.length === 0) {
      return "Society is empty.";
    }

    // Check if all children are the same type (filtered by type)
    const types = new Set(children.map((c) => c.name));
    if (types.size === 1 && !types.has("organization")) {
      return this.renderFlat(children);
    }

    return this.renderTree(children);
  }

  private renderFlat(items: readonly State[]): string {
    const lines: string[] = [];
    for (const item of items) {
      const tag = item.tag ? ` #${item.tag}` : "";
      const alias =
        Array.isArray(item.alias) && item.alias.length ? ` (${item.alias.join(", ")})` : "";
      lines.push(`${item.id ?? "(no id)"}${alias}${tag}`);
    }
    return lines.join("\n");
  }

  private renderTree(children: readonly State[]): string {
    const orgs = children.filter((c) => c.name === "organization");
    const individuals = children.filter((c) => c.name === "individual");

    // Build a map: individual id → positions they serve
    const individualPositions = new Map<string, string[]>();
    for (const ind of individuals) {
      const serves = ind.links?.filter((l) => l.relation === "serve") ?? [];
      if (serves.length > 0) {
        individualPositions.set(
          ind.id ?? "",
          serves.map((l) => l.target.id ?? "(no id)")
        );
      }
    }

    const affiliatedIndividuals = new Set<string>();
    const lines: string[] = [];

    for (const org of orgs) {
      const alias =
        Array.isArray(org.alias) && org.alias.length ? ` (${org.alias.join(", ")})` : "";
      const tag = org.tag ? ` #${org.tag}` : "";
      lines.push(`${org.id}${alias}${tag}`);

      // Projects owned by this org
      const projects = org.links?.filter((l) => l.relation === "project") ?? [];
      for (const p of projects) {
        const pAlias =
          Array.isArray(p.target.alias) && p.target.alias.length
            ? ` (${p.target.alias.join(", ")})`
            : "";
        const pTag = p.target.tag ? ` #${p.target.tag}` : "";
        lines.push(`  📦 ${p.target.id ?? "(no id)"}${pAlias}${pTag}`);
      }

      // Members of this org
      const members = org.links?.filter((l) => l.relation === "membership") ?? [];
      if (members.length === 0 && projects.length === 0) {
        lines.push("  (empty)");
      }
      for (const m of members) {
        affiliatedIndividuals.add(m.target.id ?? "");
        const mAlias =
          Array.isArray(m.target.alias) && m.target.alias.length
            ? ` (${m.target.alias.join(", ")})`
            : "";
        const mTag = m.target.tag ? ` #${m.target.tag}` : "";
        const posLabels = individualPositions.get(m.target.id ?? "");
        const posStr = posLabels?.length ? ` — ${posLabels.join(", ")}` : "";
        lines.push(`  ${m.target.id}${mAlias}${mTag}${posStr}`);
      }
      lines.push("");
    }

    // Unaffiliated individuals
    const unaffiliated = individuals.filter((ind) => !affiliatedIndividuals.has(ind.id ?? ""));
    if (unaffiliated.length > 0) {
      lines.push("─── unaffiliated ───");
      for (const ind of unaffiliated) {
        const alias =
          Array.isArray(ind.alias) && ind.alias.length ? ` (${ind.alias.join(", ")})` : "";
        const tag = ind.tag ? ` #${ind.tag}` : "";
        const posLabels = individualPositions.get(ind.id ?? "");
        const posStr = posLabels?.length ? ` — ${posLabels.join(", ")}` : "";
        lines.push(`  ${ind.id}${alias}${tag}${posStr}`);
      }
    }

    return lines.join("\n");
  }
}
