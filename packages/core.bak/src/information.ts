/**
 * RoleX Information Types — static, self-describing content.
 *
 * Information is self-contained: a goal description doesn't change
 * based on who holds it. All information in RoleX is encoded
 * as Gherkin Feature files.
 *
 * Nine types, grouped by which structure holds them:
 *
 *   Role:     persona, knowledge, experience, voice
 *   Position: duty
 *   Free:     skill, goal, plan, task
 *
 * "Free" information lives within Role when active but is
 * defined independently (skills are shared, goals are per-role).
 */

import type { InformationType } from "@rolexjs/model";

// ========== Role identity information ==========

export const PERSONA: InformationType = {
  type: "persona",
  description: "Who the role is — personality, values, background.",
  belongsTo: "Role",
};

export const KNOWLEDGE: InformationType = {
  type: "knowledge",
  description:
    "What the role knows a priori — transmittable, structured understanding.",
  belongsTo: "Role",
};

export const EXPERIENCE: InformationType = {
  type: "experience",
  description:
    "What the role has learned a posteriori — synthesized from encounters.",
  belongsTo: "Role",
};

export const VOICE: InformationType = {
  type: "voice",
  description: "How the role communicates — tone, style, language patterns.",
  belongsTo: "Role",
};

// ========== Organization information ==========

export const CHARTER: InformationType = {
  type: "charter",
  description:
    "The founding document of an organization — its mission, rules, and values.",
  belongsTo: "Organization",
};

// ========== Position information ==========

export const DUTY: InformationType = {
  type: "duty",
  description:
    "Responsibilities defined by a position — injected into role identity when on duty.",
  belongsTo: "Position",
};

// ========== Goal-driven information ==========

export const GOAL: InformationType = {
  type: "goal",
  description: "What the role wants to achieve — a desired outcome.",
  belongsTo: "Role",
};

export const PLAN: InformationType = {
  type: "plan",
  description:
    "How to achieve a goal — a decomposition into phases or steps.",
  belongsTo: "Role",
};

export const TASK: InformationType = {
  type: "task",
  description: "A concrete unit of work within a plan.",
  belongsTo: "Role",
};

// ========== Skill information ==========

export const SKILL: InformationType = {
  type: "skill",
  description:
    "Operational knowledge — a pluggable capability injected into role identity when equipped.",
  belongsTo: "Role",
};

export const INFORMATION_TYPES: readonly InformationType[] = [
  PERSONA,
  KNOWLEDGE,
  EXPERIENCE,
  VOICE,
  CHARTER,
  DUTY,
  GOAL,
  PLAN,
  TASK,
  SKILL,
];
