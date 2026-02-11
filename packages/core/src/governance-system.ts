/**
 * Governance System — internal organization operations.
 *
 * 9 processes: rule, establish, abolish, assign,
 *              hire, fire, appoint, dismiss, directory
 *
 * These are done WITHIN the organization by its governance.
 *
 * Uses graph primitives for topology (ctx.graph)
 * and platform for content persistence (ctx.platform).
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { GraphModel, Process, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import { t } from "./i18n/index.js";
import {
  RULE,
  ESTABLISH,
  ABOLISH,
  ASSIGN,
  HIRE,
  FIRE,
  APPOINT,
  DISMISS,
  DIRECTORY,
} from "./organization.js";

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

function renderFeature(f: Feature): string {
  const tag = f.type ? `# type: ${f.type}` : "";
  const name = f.name ?? "";
  return `${tag}\n${name}`.trim();
}

// ========== Process Definitions ==========

const rule: Process<{ orgName: string; name: string; source: string }, Feature> = {
  ...RULE,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    name: z.string().describe("Charter entry name"),
    source: z.string().describe("Gherkin charter source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "charter");
    const key = `${params.orgName}/${params.name}`;

    if (ctx.graph.hasNode(key)) {
      // Update: just write content
      ctx.platform.writeContent(key, feature);
    } else {
      // Create: topology + content
      ctx.graph.addNode(key, "charter");
      ctx.graph.relateTo(params.orgName, key, "has-info");
      ctx.platform.writeContent(key, feature);
    }

    return `[${params.orgName}] ${t(ctx.locale, "governance.charter", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const establish: Process<{ orgName: string; name: string; source: string }, Feature> = {
  ...ESTABLISH,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    name: z.string().describe("Position name"),
    source: z.string().describe("Gherkin duty source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "duty");
    const key = `${params.orgName}/${params.name}`;

    // Graph topology: position node + relation to org
    ctx.graph.addNode(key, "position");
    ctx.graph.relateTo(params.orgName, key, "has-position");

    // Graph topology: duty node + relation to position
    const dutyKey = `${key}/duty`;
    ctx.graph.addNode(dutyKey, "duty");
    ctx.graph.relateTo(key, dutyKey, "has-info");

    // Content persistence
    ctx.platform.writeContent(dutyKey, feature);

    return `[${params.orgName}] ${t(ctx.locale, "governance.established", { name: params.name })}`;
  },
};

const abolish: Process<{ orgName: string; name: string }, Feature> = {
  ...ABOLISH,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    name: z.string().describe("Position name to abolish"),
  }),
  execute(ctx, params) {
    const key = `${params.orgName}/${params.name}`;

    // Shadow cascades to duty and assignment nodes
    ctx.graph.shadow(key);

    return `[${params.orgName}] ${t(ctx.locale, "governance.abolished", { name: params.name })}`;
  },
};

const assign: Process<{ positionName: string; name: string; source: string }, Feature> = {
  ...ASSIGN,
  params: z.object({
    positionName: z.string().describe("Position name"),
    name: z.string().describe("Duty entry name"),
    source: z.string().describe("Gherkin duty source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "duty");
    const key = `${params.positionName}/${params.name}`;

    if (!ctx.graph.hasNode(key)) {
      // Create: topology + content
      ctx.graph.addNode(key, "duty");
      ctx.graph.relateTo(params.positionName, key, "has-info");
    }

    // Write content (both create and update)
    ctx.platform.writeContent(key, feature);

    return `[${params.positionName}] ${t(ctx.locale, "governance.duty", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const hire: Process<{ orgName: string; roleName: string }, Feature> = {
  ...HIRE,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    roleName: z.string().describe("Role name to hire"),
  }),
  execute(ctx, params) {
    // Bidirectional membership
    ctx.graph.relate(params.orgName, params.roleName, "member");

    return `[${params.orgName}] ${t(ctx.locale, "governance.hired", { name: params.roleName })}`;
  },
};

const fire: Process<{ orgName: string; roleName: string }, Feature> = {
  ...FIRE,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    roleName: z.string().describe("Role name to fire"),
  }),
  execute(ctx, params) {
    // Remove all position assignments first
    const positions = ctx.graph.neighbors(params.roleName, "assigned");
    for (const pos of positions) {
      ctx.graph.unrelate(pos, params.roleName);
    }

    // Remove membership
    ctx.graph.unrelate(params.orgName, params.roleName);

    return `[${params.orgName}] ${t(ctx.locale, "governance.fired", { name: params.roleName })}`;
  },
};

const appoint: Process<{ roleName: string; positionName: string }, Feature> = {
  ...APPOINT,
  params: z.object({
    roleName: z.string().describe("Role name"),
    positionName: z.string().describe("Position name"),
  }),
  execute(ctx, params) {
    // Assign role to position
    ctx.graph.relate(params.positionName, params.roleName, "assigned");

    return `[${params.roleName}] ${t(ctx.locale, "governance.appointed", { name: params.positionName })}`;
  },
};

const dismiss: Process<{ roleName: string; positionName: string }, Feature> = {
  ...DISMISS,
  params: z.object({
    roleName: z.string().describe("Role name"),
    positionName: z.string().describe("Position name"),
  }),
  execute(ctx, params) {
    // Remove assignment
    ctx.graph.unrelate(params.positionName, params.roleName);

    return `[${params.roleName}] ${t(ctx.locale, "governance.dismissed", { name: params.positionName })}`;
  },
};

const directory: Process<{ orgName: string }, Feature> = {
  ...DIRECTORY,
  params: z.object({
    orgName: z.string().describe("Organization name"),
  }),
  execute(ctx, params) {
    // Query members (exclude shadowed)
    const members = ctx.graph
      .neighbors(params.orgName, "member")
      .filter((k) => !ctx.graph.getNode(k)?.shadow);

    // Query positions (exclude shadowed)
    const positions = ctx.graph
      .outNeighbors(params.orgName, "has-position")
      .filter((k) => !ctx.graph.getNode(k)?.shadow);

    const memberLines = members.map((m) => {
      const assignments = ctx.graph
        .neighbors(m, "assigned")
        .filter((k) => !ctx.graph.getNode(k)?.shadow);
      const posInfo = assignments.length > 0 ? ` (${assignments.join(", ")})` : "";
      return `  - ${m}${posInfo}`;
    });

    const positionLines = positions.map((p) => {
      // Get duty nodes: outbound neighbors with has-info, filtered to type "duty"
      const duties = ctx.graph
        .outNeighbors(p, "has-info")
        .filter((k) => {
          const node = ctx.graph.getNode(k);
          return node && node.type === "duty" && !node.shadow;
        });
      const dutyNames = duties.map((d) => d.split("/").pop()).join(", ");
      return `  - ${p}${dutyNames ? `: ${dutyNames}` : ""}`;
    });

    const l = ctx.locale;
    const membersInfo =
      memberLines.length > 0
        ? `${t(l, "governance.members")}\n${memberLines.join("\n")}`
        : t(l, "governance.membersNone");
    const positionsInfo =
      positionLines.length > 0
        ? `${t(l, "governance.positions")}\n${positionLines.join("\n")}`
        : t(l, "governance.positionsNone");

    return `[${params.orgName}] ${t(l, "governance.directory")}\n${membersInfo}\n${positionsInfo}`;
  },
};

// ========== System Factory ==========

/** Create the governance system, ready to execute. */
export function createGovernanceSystem(graph: GraphModel, platform: Platform): RunnableSystem<Feature> {
  return defineSystem(graph, platform, {
    name: "governance",
    description: "Internal governance — rules, positions, membership, assignments.",
    processes: { rule, establish, abolish, assign, hire, fire, appoint, dismiss, directory },
  });
}
