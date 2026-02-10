/**
 * descriptions — Gherkin descriptions for Rolex world + Individual System processes.
 *
 * Source of truth: descriptions/<name>/<name>.feature
 * Built by tsup with esbuild text loader — .feature files are inlined at build time.
 */

// World-level descriptions
import rolexFeature from "./descriptions/rolex/rolex.feature";
import roleFeature from "./descriptions/rolex/role.feature";
import cognitionFeature from "./descriptions/rolex/cognition.feature";
import executionFeature from "./descriptions/rolex/execution.feature";
import growthFeature from "./descriptions/rolex/growth.feature";
import capabilityFeature from "./descriptions/rolex/capability.feature";
import gherkinFeature from "./descriptions/rolex/gherkin.feature";

// Process descriptions
import identityFeature from "./descriptions/identity/identity.feature";
import focusFeature from "./descriptions/focus/focus.feature";
import wantFeature from "./descriptions/want/want.feature";
import designFeature from "./descriptions/design/design.feature";
import todoFeature from "./descriptions/todo/todo.feature";
import finishFeature from "./descriptions/finish/finish.feature";
import achieveFeature from "./descriptions/achieve/achieve.feature";
import abandonFeature from "./descriptions/abandon/abandon.feature";
import synthesizeFeature from "./descriptions/synthesize/synthesize.feature";
import reflectFeature from "./descriptions/reflect/reflect.feature";
import skillFeature from "./descriptions/skill/skill.feature";
import useFeature from "./descriptions/use/use.feature";

/** Rolex world description topic names. */
export const WORLD_TOPICS = [
  "rolex", "role", "cognition", "execution",
  "growth", "capability", "gherkin",
] as const;

export type WorldTopic = (typeof WORLD_TOPICS)[number];

/** All Individual System process names. */
export const PROCESS_NAMES = [
  "identity", "focus",
  "want", "design", "todo",
  "finish", "achieve", "abandon",
  "synthesize", "reflect",
  "skill", "use",
] as const;

export type ProcessName = (typeof PROCESS_NAMES)[number];

/** World-level Gherkin descriptions — the foundational positioning for AI. */
export const world: Record<WorldTopic, string> = {
  rolex: rolexFeature,
  role: roleFeature,
  cognition: cognitionFeature,
  execution: executionFeature,
  growth: growthFeature,
  capability: capabilityFeature,
  gherkin: gherkinFeature,
};

/** Gherkin descriptions for each Individual System process. */
export const descriptions: Record<ProcessName, string> = {
  identity: identityFeature,
  focus: focusFeature,
  want: wantFeature,
  design: designFeature,
  todo: todoFeature,
  finish: finishFeature,
  achieve: achieveFeature,
  abandon: abandonFeature,
  synthesize: synthesizeFeature,
  reflect: reflectFeature,
  skill: skillFeature,
  use: useFeature,
};
