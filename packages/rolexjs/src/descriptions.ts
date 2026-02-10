/**
 * descriptions — Gherkin descriptions for all RoleX systems and processes.
 *
 * Structure: descriptions/[system]/[command]/[command].feature
 * Built by tsup with esbuild text loader — .feature files are inlined at build time.
 */

// ========== Rolex (top-level) ==========

import rolexFeature from "./descriptions/rolex/rolex.feature";
import informationFeature from "./descriptions/rolex/information/information.feature";
import executionFeature from "./descriptions/rolex/execution/execution.feature";
import growthFeature from "./descriptions/rolex/growth/growth.feature";
import capabilityFeature from "./descriptions/rolex/capability/capability.feature";
import gherkinFeature from "./descriptions/rolex/gherkin/gherkin.feature";

// ========== Individual System ==========

import individualFeature from "./descriptions/individual/individual.feature";
import identityFeature from "./descriptions/individual/identity/identity.feature";
import focusFeature from "./descriptions/individual/focus/focus.feature";
import wantFeature from "./descriptions/individual/want/want.feature";
import designFeature from "./descriptions/individual/design/design.feature";
import todoFeature from "./descriptions/individual/todo/todo.feature";
import finishFeature from "./descriptions/individual/finish/finish.feature";
import achieveFeature from "./descriptions/individual/achieve/achieve.feature";
import abandonFeature from "./descriptions/individual/abandon/abandon.feature";
import forgetFeature from "./descriptions/individual/forget/forget.feature";

import reflectFeature from "./descriptions/individual/reflect/reflect.feature";
import contemplateFeature from "./descriptions/individual/contemplate/contemplate.feature";
import skillFeature from "./descriptions/individual/skill/skill.feature";
import useFeature from "./descriptions/individual/use/use.feature";

// ========== Role System ==========

import roleFeature from "./descriptions/role/role.feature";
import bornFeature from "./descriptions/role/born/born.feature";
import teachFeature from "./descriptions/role/teach/teach.feature";
import trainFeature from "./descriptions/role/train/train.feature";

// ========== Org System ==========

import orgFeature from "./descriptions/org/org.feature";
import foundFeature from "./descriptions/org/found/found.feature";

// ========== Governance System ==========

import governanceFeature from "./descriptions/governance/governance.feature";
import hireFeature from "./descriptions/governance/hire/hire.feature";
import fireFeature from "./descriptions/governance/fire/fire.feature";
import directoryFeature from "./descriptions/governance/directory/directory.feature";

// ========== World Topics ==========

/** Rolex world description topic names. */
export const WORLD_TOPICS = [
  "rolex", "information", "execution",
  "growth", "capability", "gherkin",
] as const;

export type WorldTopic = (typeof WORLD_TOPICS)[number];

/** World-level Gherkin descriptions — the foundational positioning for AI. */
export const world: Record<WorldTopic, string> = {
  rolex: rolexFeature,
  information: informationFeature,
  execution: executionFeature,
  growth: growthFeature,
  capability: capabilityFeature,
  gherkin: gherkinFeature,
};

// ========== System Descriptions ==========

export const systems = {
  individual: individualFeature,
  role: roleFeature,
  org: orgFeature,
  governance: governanceFeature,
} as const;

// ========== Process Descriptions (by system) ==========

/** Individual System processes. */
export const individual = {
  identity: identityFeature,
  focus: focusFeature,
  want: wantFeature,
  design: designFeature,
  todo: todoFeature,
  finish: finishFeature,
  achieve: achieveFeature,
  abandon: abandonFeature,
  forget: forgetFeature,
  reflect: reflectFeature,
  contemplate: contemplateFeature,
  skill: skillFeature,
  use: useFeature,
} as const;

/** Role System processes. */
export const role = {
  born: bornFeature,
  teach: teachFeature,
  train: trainFeature,
} as const;

/** Org System processes. */
export const org = {
  found: foundFeature,
} as const;

/** Governance System processes. */
export const governance = {
  hire: hireFeature,
  fire: fireFeature,
  directory: directoryFeature,
} as const;

// ========== Backward-compatible flat exports ==========

/** @deprecated Use `individual` instead. */
export const descriptions = individual;

export const PROCESS_NAMES = Object.keys(individual) as (keyof typeof individual)[];
export type ProcessName = keyof typeof individual;
