/**
 * Base role templates — built-in identity shipped with the package.
 *
 * Structure:
 *   _common/   — shared by ALL roles
 *   <role>/    — role-specific templates
 *
 * identity() merges: _common → role-specific → local growth
 * Upgrade = upgrade the package. Local growth is never touched.
 */

import type { Feature, Scenario } from "@rolexjs/core";
import { parse } from "@rolexjs/parser";
import type { BaseProvider } from "@rolexjs/system";

// ========== _common ==========

// (empty — add shared knowledge here when needed)

// ========== nuwa ==========

import nuwaOrgMgmt from "./nuwa/org-management.knowledge.procedure.feature";
import nuwaPersona from "./nuwa/persona.feature";
import nuwaRoleMgmt from "./nuwa/role-management.knowledge.procedure.feature";

// ========== guider ==========

import guiderCapability from "./guider/capability-system.knowledge.pattern.feature";
import guiderExecution from "./guider/execution-cycle.knowledge.pattern.feature";
import guiderGherkin from "./guider/gherkin-basics.knowledge.pattern.feature";
import guiderGrowth from "./guider/growth-cycle.knowledge.pattern.feature";
import guiderPersona from "./guider/persona.feature";
import guiderOverview from "./guider/rolex-overview.knowledge.pattern.feature";

// ========== Parser ==========

function parseFeature(source: string, type: Feature["type"]): Feature {
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

// ========== Feature Registry ==========

const common: Feature[] = [];

const roles: Record<string, Feature[]> = {
  nuwa: [
    parseFeature(nuwaPersona, "persona"),
    parseFeature(nuwaRoleMgmt, "knowledge.procedure"),
    parseFeature(nuwaOrgMgmt, "knowledge.procedure"),
  ],
  guider: [
    parseFeature(guiderPersona, "persona"),
    parseFeature(guiderOverview, "knowledge.pattern"),
    parseFeature(guiderExecution, "knowledge.pattern"),
    parseFeature(guiderGrowth, "knowledge.pattern"),
    parseFeature(guiderCapability, "knowledge.pattern"),
    parseFeature(guiderGherkin, "knowledge.pattern"),
  ],
};

// ========== BaseProvider ==========

export const base: BaseProvider<Feature> = {
  listRoles(): string[] {
    return Object.keys(roles);
  },

  listIdentity(roleName: string): Feature[] {
    return [...common, ...(roles[roleName] ?? [])];
  },

  readInformation(roleName: string, type: string, name: string): Feature | null {
    const all = [...common, ...(roles[roleName] ?? [])];
    return all.find((f) => f.type === type && f.name === name) ?? null;
  },
};
