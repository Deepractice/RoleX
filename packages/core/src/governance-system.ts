/**
 * Governance System — internal organization operations.
 *
 * 9 processes: rule, establish, abolish, assign,
 *              hire, fire, appoint, dismiss, directory
 *
 * These are done WITHIN the organization by its governance.
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { Process, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import {
  RULE, ESTABLISH, ABOLISH, ASSIGN,
  HIRE, FIRE, APPOINT, DISMISS, DIRECTORY,
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
    ctx.platform.writeInformation(params.orgName, "charter", params.name, feature);
    return `[${params.orgName}] charter: ${params.name}\n\n${renderFeature(feature)}`;
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
    ctx.platform.createStructure(params.name, params.orgName);
    const feature = parseSource(params.source, "duty");
    ctx.platform.writeInformation(params.name, "duty", "duty", feature);
    return `[${params.orgName}] established: ${params.name}`;
  },
};

const abolish: Process<{ orgName: string; name: string }, Feature> = {
  ...ABOLISH,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    name: z.string().describe("Position name to abolish"),
  }),
  execute(ctx, params) {
    // Remove all assignments to this position first
    const members = ctx.platform.listRelations("membership", params.orgName);
    for (const member of members) {
      ctx.platform.removeRelation("assignment", member, params.name);
    }
    ctx.platform.removeStructure(params.name);
    return `[${params.orgName}] abolished: ${params.name}`;
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
    ctx.platform.writeInformation(params.positionName, "duty", params.name, feature);
    return `[${params.positionName}] duty: ${params.name}\n\n${renderFeature(feature)}`;
  },
};

const hire: Process<{ orgName: string; roleName: string }, Feature> = {
  ...HIRE,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    roleName: z.string().describe("Role name to hire"),
  }),
  execute(ctx, params) {
    ctx.platform.addRelation("membership", params.orgName, params.roleName);
    return `[${params.orgName}] hired: ${params.roleName}`;
  },
};

const fire: Process<{ orgName: string; roleName: string }, Feature> = {
  ...FIRE,
  params: z.object({
    orgName: z.string().describe("Organization name"),
    roleName: z.string().describe("Role name to fire"),
  }),
  execute(ctx, params) {
    // Auto-dismiss from all positions
    const positions = ctx.platform.listRelations("assignment", params.roleName);
    for (const pos of positions) {
      ctx.platform.removeRelation("assignment", params.roleName, pos);
    }
    ctx.platform.removeRelation("membership", params.orgName, params.roleName);
    return `[${params.orgName}] fired: ${params.roleName}`;
  },
};

const appoint: Process<{ roleName: string; positionName: string }, Feature> = {
  ...APPOINT,
  params: z.object({
    roleName: z.string().describe("Role name"),
    positionName: z.string().describe("Position name"),
  }),
  execute(ctx, params) {
    ctx.platform.addRelation("assignment", params.roleName, params.positionName);
    return `[${params.roleName}] appointed to: ${params.positionName}`;
  },
};

const dismiss: Process<{ roleName: string; positionName: string }, Feature> = {
  ...DISMISS,
  params: z.object({
    roleName: z.string().describe("Role name"),
    positionName: z.string().describe("Position name"),
  }),
  execute(ctx, params) {
    ctx.platform.removeRelation("assignment", params.roleName, params.positionName);
    return `[${params.roleName}] dismissed from: ${params.positionName}`;
  },
};

const directory: Process<{ orgName: string }, Feature> = {
  ...DIRECTORY,
  params: z.object({
    orgName: z.string().describe("Organization name"),
  }),
  execute(ctx, params) {
    const members = ctx.platform.listRelations("membership", params.orgName);
    const positions = ctx.platform.listStructures(params.orgName);

    const memberLines = members.map((m) => {
      const assignments = ctx.platform.listRelations("assignment", m);
      const posInfo = assignments.length > 0 ? ` (${assignments.join(", ")})` : "";
      return `  - ${m}${posInfo}`;
    });

    const positionLines = positions.map((p) => {
      const duties = ctx.platform.listInformation(p, "duty");
      const dutyNames = duties.map((d) => d.name).join(", ");
      return `  - ${p}${dutyNames ? `: ${dutyNames}` : ""}`;
    });

    const membersInfo = memberLines.length > 0
      ? `Members:\n${memberLines.join("\n")}`
      : "Members: none";
    const positionsInfo = positionLines.length > 0
      ? `Positions:\n${positionLines.join("\n")}`
      : "Positions: none";

    return `[${params.orgName}] directory\n${membersInfo}\n${positionsInfo}`;
  },
};

// ========== System Factory ==========

/** Create the governance system, ready to execute. */
export function createGovernanceSystem(platform: Platform): RunnableSystem<Feature> {
  return defineSystem(platform, {
    name: "governance",
    description: "Internal governance — rules, positions, membership, assignments.",
    processes: { rule, establish, abolish, assign, hire, fire, appoint, dismiss, directory },
  });
}
