/**
 * api/skill.ts — Skill-level API operations.
 *
 * Capability management: create, equip, unequip.
 * Skills are independent peer entities — any born role can equip them.
 */

import { z } from "zod";
import type { ApiOperation } from "./types.js";
import { DESC_SKILL } from "../descriptions.js";
import { next, NEXT } from "../render.js";

export const create: ApiOperation<{ name: string; source: string }> = {
  name: "createSkill",
  namespace: "skill",
  description: DESC_SKILL,
  parameters: z.object({
    name: z.string().describe("Skill name"),
    source: z.string().describe("Gherkin feature source describing the skill"),
  }),
  permission: "nuwa",
  execute(ctx, { name, source }) {
    const skill = ctx.rolex.createSkill(name, source);
    return next(`Skill created: ${skill.name}`, NEXT.createSkill);
  },
};

export const equip: ApiOperation<{ roleId: string; skillName: string }> = {
  name: "equip",
  namespace: "skill",
  description:
    "Equip a skill to a role \u2014 gain the capability.\n\nThe skill must exist (created via createSkill). Once equipped, the skill's content is injected into the role's identity.",
  parameters: z.object({
    roleId: z.string().describe("Role name to equip the skill to"),
    skillName: z.string().describe("Skill name to equip"),
  }),
  permission: "nuwa",
  execute(ctx, { roleId, skillName }) {
    ctx.platform.equip(roleId, skillName);
    return next(`Skill equipped: ${roleId} \u2190 ${skillName}`, NEXT.equip);
  },
};

export const unequip: ApiOperation<{ roleId: string; skillName: string }> = {
  name: "unequip",
  namespace: "skill",
  description:
    "Unequip a skill from a role \u2014 remove the capability.\n\nThe skill remains in the system; only the role's equipment is changed.",
  parameters: z.object({
    roleId: z.string().describe("Role name to unequip the skill from"),
    skillName: z.string().describe("Skill name to unequip"),
  }),
  permission: "nuwa",
  execute(ctx, { roleId, skillName }) {
    ctx.platform.unequip(roleId, skillName);
    return next(`Skill unequipped: ${roleId} \u2715 ${skillName}`, NEXT.unequip);
  },
};

/** All skill operations. */
export const skillOperations = {
  create,
  equip,
  unequip,
} as const;
