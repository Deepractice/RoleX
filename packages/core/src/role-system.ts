/**
 * Role System — external management of role lifecycle.
 *
 * 5 processes: born, teach, train, retire, kill
 *
 * These are done TO a role from the outside,
 * not BY the role itself.
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { GraphModel, Process, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import { t } from "./i18n/index.js";
import { BORN, TEACH, TRAIN, RETIRE, KILL } from "./Role.js";

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

const born: Process<{ name: string; source: string }, Feature> = {
  ...BORN,
  params: z.object({
    name: z.string().describe("Role name"),
    source: z.string().describe("Gherkin persona source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "persona");

    // Graph topology: role node + persona node + relation
    ctx.graph.addNode(params.name, "role");
    const personaKey = `${params.name}/persona`;
    ctx.graph.addNode(personaKey, "persona");
    ctx.graph.relateTo(params.name, personaKey, "has-info");

    // Link to society if it exists
    if (ctx.graph.hasNode("society")) {
      ctx.graph.relate("society", params.name, "has-role");
    }

    // Content persistence
    ctx.platform.writeContent(personaKey, feature);

    return `[${params.name}] ${t(ctx.locale, "role.born")}\n\n${renderFeature(feature)}`;
  },
};

const teach: Process<{ roleId: string; name: string; source: string }, Feature> = {
  ...TEACH,
  params: z.object({
    roleId: z.string().describe("Role name"),
    name: z.string().describe("Knowledge dimension name"),
    source: z.string().describe("Gherkin knowledge source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "knowledge.pattern");

    // Graph topology: knowledge node + relation
    const key = `${params.roleId}/${params.name}`;
    ctx.graph.addNode(key, "knowledge.pattern");
    ctx.graph.relateTo(params.roleId, key, "has-info");

    // Content persistence
    ctx.platform.writeContent(key, feature);

    return `[${params.roleId}] ${t(ctx.locale, "role.taught", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const train: Process<{ roleId: string; name: string; source: string }, Feature> = {
  ...TRAIN,
  params: z.object({
    roleId: z.string().describe("Role name"),
    name: z.string().describe("Procedure name"),
    source: z.string().describe("Gherkin procedure source"),
  }),
  execute(ctx, params) {
    const feature = parseSource(params.source, "knowledge.procedure");

    // Graph topology: procedure node + relation
    const key = `${params.roleId}/${params.name}`;
    ctx.graph.addNode(key, "knowledge.procedure");
    ctx.graph.relateTo(params.roleId, key, "has-info");

    // Content persistence
    ctx.platform.writeContent(key, feature);

    return `[${params.roleId}] ${t(ctx.locale, "role.trained", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const retire: Process<{ name: string }, Feature> = {
  ...RETIRE,
  params: z.object({
    name: z.string().describe("Role name to retire"),
  }),
  execute(ctx, params) {
    // Shadow the role node — cascades to all children
    ctx.graph.shadow(params.name);

    // Also mark the persona content with @retired tag
    const personaKey = `${params.name}/persona`;
    const persona = ctx.platform.readContent(personaKey);
    if (persona) {
      const updated = {
        ...persona,
        tags: [...(persona.tags || []), { name: "@retired" }],
      } as Feature;
      ctx.platform.writeContent(personaKey, updated);
    }

    return `[${params.name}] ${t(ctx.locale, "role.retired")}`;
  },
};

const kill: Process<{ name: string }, Feature> = {
  ...KILL,
  params: z.object({
    name: z.string().describe("Role name to permanently destroy"),
  }),
  execute(ctx, params) {
    // Drop all children first, then the role node itself
    const children = ctx.graph.outNeighbors(params.name);
    for (const child of children) {
      ctx.graph.dropNode(child);
    }
    ctx.graph.dropNode(params.name);

    return `[${params.name}] ${t(ctx.locale, "role.killed")}`;
  },
};

// ========== System Factory ==========

/** Create the role system, ready to execute. */
export function createRoleSystem(graph: GraphModel, platform: Platform): RunnableSystem<Feature> {
  return defineSystem(graph, platform, {
    name: "role",
    description: "External management of role lifecycle — create, cultivate, retire, destroy.",
    processes: { born, teach, train, retire, kill },
  });
}
