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

import { parse } from "@rolexjs/parser";
import type { Feature, Scenario } from "@rolexjs/core";
import type { BaseProvider } from "@rolexjs/system";

// ========== _common ==========

import commonRolexUsage from "./_common/rolex-usage.knowledge.feature";

// ========== nuwa ==========

import nuwaPersona from "./nuwa/persona.feature";

// ========== waiter ==========

import waiterPersona from "./waiter/persona.feature";

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

const common: Feature[] = [
  parseFeature(commonRolexUsage, "knowledge"),
];

const roles: Record<string, Feature[]> = {
  nuwa: [parseFeature(nuwaPersona, "persona")],
  waiter: [parseFeature(waiterPersona, "persona")],
};

// ========== BaseProvider ==========

export const base: BaseProvider<Feature> = {
  listIdentity(roleName: string): Feature[] {
    return [...common, ...(roles[roleName] ?? [])];
  },

  readInformation(roleName: string, type: string, name: string): Feature | null {
    const all = [...common, ...(roles[roleName] ?? [])];
    return all.find((f) => f.type === type && f.name === name) ?? null;
  },
};
