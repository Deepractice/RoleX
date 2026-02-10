/**
 * Organization System — external lifecycle management.
 *
 * 2 processes: found, dissolve
 *
 * These are done TO an organization from the outside.
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { Process, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import { t } from "./i18n/index.js";
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
    ctx.platform.createStructure(params.name, params.parent);
    const feature = parseSource(params.source, "charter");
    ctx.platform.writeInformation(params.name, "charter", "charter", feature);
    return `[${params.name}] ${t(ctx.locale, "org.founded")}`;
  },
};

const dissolve: Process<{ name: string }, Feature> = {
  ...DISSOLVE,
  params: z.object({
    name: z.string().describe("Organization name to dissolve"),
  }),
  execute(ctx, params) {
    ctx.platform.removeStructure(params.name);
    return `[${params.name}] ${t(ctx.locale, "org.dissolved")}`;
  },
};

// ========== System Factory ==========

/** Create the organization system, ready to execute. */
export function createOrgSystem(platform: Platform): RunnableSystem<Feature> {
  return defineSystem(platform, {
    name: "org-lifecycle",
    description: "External management of organization lifecycle — create and dissolve.",
    processes: { found, dissolve },
  });
}
