/**
 * descriptions — Gherkin descriptions for all RoleX systems and processes.
 *
 * Single source of truth. .feature files are inlined at build time via esbuild text loader.
 *
 * Structure: descriptions/{system}/{process}.feature
 */

// ========== World Topics (MCP instructions) ==========

import rolexFeature from "./world/rolex.feature";
import informationFeature from "./world/information.feature";
import executionFeature from "./world/execution.feature";
import growthFeature from "./world/growth.feature";
import capabilityFeature from "./world/capability.feature";
import gherkinFeature from "./world/gherkin.feature";

export const WORLD_TOPICS = [
  "rolex",
  "information",
  "execution",
  "growth",
  "capability",
  "gherkin",
] as const;

export type WorldTopic = (typeof WORLD_TOPICS)[number];

export const world: Record<WorldTopic, string> = {
  rolex: rolexFeature,
  information: informationFeature,
  execution: executionFeature,
  growth: growthFeature,
  capability: capabilityFeature,
  gherkin: gherkinFeature,
};

// ========== Individual System ==========

import individualSystem from "./individual/individual.feature";
import identityDesc from "./individual/identity.feature";
import focusDesc from "./individual/focus.feature";
import exploreDesc from "./individual/explore.feature";
import wantDesc from "./individual/want.feature";
import designDesc from "./individual/design.feature";
import todoDesc from "./individual/todo.feature";
import finishDesc from "./individual/finish.feature";
import achieveDesc from "./individual/achieve.feature";
import abandonDesc from "./individual/abandon.feature";
import forgetDesc from "./individual/forget.feature";
import reflectDesc from "./individual/reflect.feature";
import contemplateDesc from "./individual/contemplate.feature";
import skillDesc from "./individual/skill.feature";
import useDesc from "./individual/use.feature";

export const individual = {
  system: individualSystem,
  identity: identityDesc,
  focus: focusDesc,
  explore: exploreDesc,
  want: wantDesc,
  design: designDesc,
  todo: todoDesc,
  finish: finishDesc,
  achieve: achieveDesc,
  abandon: abandonDesc,
  forget: forgetDesc,
  reflect: reflectDesc,
  contemplate: contemplateDesc,
  skill: skillDesc,
  use: useDesc,
} as const;

// ========== Role System ==========

import roleSystem from "./role/role.feature";
import bornDesc from "./role/born.feature";
import teachDesc from "./role/teach.feature";
import trainDesc from "./role/train.feature";
import retireDesc from "./role/retire.feature";
import killDesc from "./role/kill.feature";

export const role = {
  system: roleSystem,
  born: bornDesc,
  teach: teachDesc,
  train: trainDesc,
  retire: retireDesc,
  kill: killDesc,
} as const;

// ========== Org System ==========

import orgSystem from "./org/org.feature";
import foundDesc from "./org/found.feature";
import dissolveDesc from "./org/dissolve.feature";

export const org = {
  system: orgSystem,
  found: foundDesc,
  dissolve: dissolveDesc,
} as const;

// ========== Governance System ==========

import governanceSystem from "./governance/governance.feature";
import ruleDesc from "./governance/rule.feature";
import establishDesc from "./governance/establish.feature";
import abolishDesc from "./governance/abolish.feature";
import assignDesc from "./governance/assign.feature";
import hireDesc from "./governance/hire.feature";
import fireDesc from "./governance/fire.feature";
import appointDesc from "./governance/appoint.feature";
import dismissDesc from "./governance/dismiss.feature";
import directoryDesc from "./governance/directory.feature";

export const governance = {
  system: governanceSystem,
  rule: ruleDesc,
  establish: establishDesc,
  abolish: abolishDesc,
  assign: assignDesc,
  hire: hireDesc,
  fire: fireDesc,
  appoint: appointDesc,
  dismiss: dismissDesc,
  directory: directoryDesc,
} as const;
