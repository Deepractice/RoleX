/**
 * Organization System — external lifecycle management.
 *
 * 2 processes: found, dissolve
 *
 * These are done TO an organization from the outside.
 *
 * Graph primitives handle topology (nodes + edges).
 * Platform handles content persistence (Gherkin features).
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { GraphModel, Process, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import { t } from "./i18n/index.js";
import { org as orgDesc } from "./descriptions/index.js";
import { FOUND, DISSOLVE } from "./organization.js";

// ========== Helpers ==========

function parseSource(source: string, type: Feature["type"]): Feature {
  const doc = parse(source);
  const gherkin = doc.feature!;
  const scenarios: Scenario[] = (gherkin.children || [])
    .filter((c) => c.scenario)
    .map((c) => ({
      ...c.scenario!,
      verifiable: c.scenario!.tags.some((t) => t.name === "@testable"),
    }));
  return { ...gherkin, type, scenarios };
}

// ========== Process Definitions ==========

const found: Process<{ name: string; source: string; parent?: string }, Feature> = {
  ...FOUND,
  params: z.object({
    name: z.string().describe("Organization name"),
    source: z.string().describe("Gherkin charter source"),
    parent: z.string().optional().describe("Parent organization name"),
  }),
  execute(ctx, params) {
    const { name, source, parent } = params;

    // 1. Add organization node to graph
    ctx.graph.addNode(name, "organization");

    // 2. Link to parent or society
    if (parent) {
      ctx.graph.relateTo(parent, name, "has-sub-org");
    } else if (ctx.graph.hasNode("society")) {
      ctx.graph.relateTo("society", name, "has-org");
    }

    // 3. Add charter info node and link to organization
    const charterKey = `${name}/charter`;
    ctx.graph.addNode(charterKey, "charter");
    ctx.graph.relateTo(name, charterKey, "has-info");

    // 4. Persist charter content via platform
    const feature = parseSource(source, "charter");
    ctx.platform.writeContent(charterKey, feature);

    return `[${name}] ${t(ctx.locale, "org.founded")}`;
  },
};

const dissolve: Process<{ name: string }, Feature> = {
  ...DISSOLVE,
  params: z.object({
    name: z.string().describe("Organization name to dissolve"),
  }),
  execute(ctx, params) {
    // Cascade shadow — marks org node and all outbound descendants
    // (charter, sub-structures) as shadowed
    ctx.graph.shadow(params.name);

    return `[${params.name}] ${t(ctx.locale, "org.dissolved")}`;
  },
};

// ========== System Factory ==========

/** Create the organization system, ready to execute. */
export function createOrgSystem(graph: GraphModel, platform: Platform): RunnableSystem<Feature> {
  return defineSystem(graph, platform, {
    name: "org-lifecycle",
    description: orgDesc.system,
    processes: { found, dissolve },
  });
}
