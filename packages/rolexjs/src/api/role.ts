/**
 * api/role.ts — Role-level API operations.
 *
 * First-person lifecycle: identity, focus, want, plan, todo,
 * achieve, abandon, finish, synthesize, reflect, equip, unequip.
 */

import { z } from "zod";
import type { ApiOperation } from "./types.js";
import {
  DESC_IDENTITY,
  DESC_FOCUS,
  DESC_WANT,
  DESC_PLAN,
  DESC_TODO,
  DESC_ACHIEVE,
  DESC_ABANDON,
  DESC_REFLECT,
  DESC_FINISH,
  DESC_SYNTHESIZE,
} from "../descriptions.js";
import {
  next,
  NEXT,
  nextFinish,
  renderFeature,
  renderFeatures,
  renderStatusBar,
} from "../render.js";
import { Role } from "../Role.js";

// ========== Helpers ==========

function requireRole(ctx: { currentRole: Role | null }): Role {
  if (!ctx.currentRole) {
    throw new Error("No active role. Call identity(roleId) first to activate a role.");
  }
  return ctx.currentRole;
}

// ========== Operations ==========

export const identity: ApiOperation<{ roleId: string }> = {
  name: "identity",
  namespace: "role",
  description: DESC_IDENTITY,
  parameters: z.object({
    roleId: z.string().describe("Role name (e.g. 'sean')"),
  }),
  permission: "any",
  execute(ctx, { roleId }) {
    ctx.currentRole = new Role(ctx.platform, roleId);
    ctx.currentRoleName = roleId;
    const features = ctx.currentRole.identity();
    const { current } = ctx.currentRole.focus();
    const assignment = ctx.platform.getAssignment(roleId);
    const statusBar = renderStatusBar(roleId, current, assignment?.org, assignment?.position);
    return `${statusBar}\n\n${renderFeatures(features)}`;
  },
};

export const focus: ApiOperation<{ name?: string }> = {
  name: "focus",
  namespace: "role",
  description: DESC_FOCUS,
  parameters: z.object({
    name: z.string().optional().describe("Optional goal name to switch focus to"),
  }),
  permission: "role",
  execute(ctx, { name }) {
    const role = requireRole(ctx);
    const { current, otherGoals } = role.focus(name);

    const assignment = ctx.platform.getAssignment(ctx.currentRoleName);
    const statusBar = renderStatusBar(
      ctx.currentRoleName,
      current,
      assignment?.org,
      assignment?.position
    );

    if (!current && otherGoals.length === 0)
      return `${statusBar}\n\nNo active goal. Use want() to set a new goal.`;

    const parts: string[] = [statusBar];

    if (current) {
      parts.push(renderFeature(current));
      if (current.plan) {
        parts.push(renderFeature(current.plan));
      }
      for (const task of current.tasks) {
        parts.push(renderFeature(task));
      }
    }

    if (otherGoals.length > 0) {
      parts.push("Other active goals:");
      for (const g of otherGoals) {
        parts.push(`  - ${g.name}`);
      }
    }

    return parts.join("\n\n");
  },
};

export const want: ApiOperation<{
  name: string;
  source: string;
  testable?: boolean;
}> = {
  name: "want",
  namespace: "role",
  description: DESC_WANT,
  parameters: z.object({
    name: z.string().describe("Goal name (used as directory name, e.g. 'local-platform')"),
    source: z.string().describe("Gherkin feature source text for the goal"),
    testable: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this goal's scenarios should become persistent automated verification"),
  }),
  permission: "role",
  execute(ctx, { name, source, testable }) {
    const role = requireRole(ctx);
    const goal = role.want(name, source, testable);
    return next(`Goal created: ${goal.name}`, NEXT.want);
  },
};

export const plan: ApiOperation<{ source: string }> = {
  name: "plan",
  namespace: "role",
  description: DESC_PLAN,
  parameters: z.object({
    source: z.string().describe("Gherkin feature source text for the plan"),
  }),
  permission: "role",
  execute(ctx, { source }) {
    const role = requireRole(ctx);
    const p = role.plan(source);
    return next(`Plan created: ${p.name}`, NEXT.plan);
  },
};

export const todo: ApiOperation<{
  name: string;
  source: string;
  testable?: boolean;
}> = {
  name: "todo",
  namespace: "role",
  description: DESC_TODO,
  parameters: z.object({
    name: z.string().describe("Task name (used as filename, e.g. 'implement-loader')"),
    source: z.string().describe("Gherkin feature source text for the task"),
    testable: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this task's scenarios should become unit or integration tests"),
  }),
  permission: "role",
  execute(ctx, { name, source, testable }) {
    const role = requireRole(ctx);
    const task = role.todo(name, source, testable);
    return next(`Task created: ${task.name}`, NEXT.todo);
  },
};

export const achieve: ApiOperation<{ experience?: string }> = {
  name: "achieve",
  namespace: "role",
  description: DESC_ACHIEVE,
  parameters: z.object({
    experience: z
      .string()
      .optional()
      .describe(
        "Optional Gherkin feature source capturing what was learned \u2014 auto-saved as experience synthesis"
      ),
  }),
  permission: "role",
  execute(ctx, { experience }) {
    const role = requireRole(ctx);
    role.achieve(experience);
    const msg = experience ? "Goal achieved. Experience captured." : "Goal achieved.";
    return next(msg, NEXT.achieve);
  },
};

export const abandon: ApiOperation<{ experience?: string }> = {
  name: "abandon",
  namespace: "role",
  description: DESC_ABANDON,
  parameters: z.object({
    experience: z
      .string()
      .optional()
      .describe(
        "Optional Gherkin feature source capturing what was learned \u2014 auto-saved as experience synthesis"
      ),
  }),
  permission: "role",
  execute(ctx, { experience }) {
    const role = requireRole(ctx);
    role.abandon(experience);
    const msg = experience ? "Goal abandoned. Experience captured." : "Goal abandoned.";
    return next(msg, NEXT.abandon);
  },
};

export const finish: ApiOperation<{ name: string; experience?: string }> = {
  name: "finish",
  namespace: "role",
  description: DESC_FINISH,
  parameters: z.object({
    name: z.string().describe("Task name to mark as done"),
    experience: z
      .string()
      .optional()
      .describe(
        "Optional Gherkin feature source capturing what was learned \u2014 auto-saved as experience synthesis"
      ),
  }),
  permission: "role",
  execute(ctx, { name, experience }) {
    const role = requireRole(ctx);
    role.finish(name, experience);

    // Dynamic hint: check remaining tasks
    const { current } = role.focus();
    const remaining = current
      ? current.tasks.filter((t) => !t.tags?.some((tag) => tag.name === "@done")).length
      : -1;
    const msg = experience
      ? `Task finished: ${name}. Experience captured.`
      : `Task finished: ${name}`;
    return next(msg, remaining >= 0 ? nextFinish(remaining) : NEXT.achieve);
  },
};

export const synthesize: ApiOperation<{ name: string; source: string }> = {
  name: "synthesize",
  namespace: "role",
  description: DESC_SYNTHESIZE,
  parameters: z.object({
    name: z
      .string()
      .describe("Name for this experience (used as filename, e.g. 'auth-system-lessons')"),
    source: z.string().describe("Gherkin feature source text"),
  }),
  permission: "role",
  execute(ctx, { name, source }) {
    const role = requireRole(ctx);
    const feature = role.synthesize(name, source);
    return next(`Experience synthesized: ${feature.name}`, NEXT.synthesize);
  },
};

export const reflect: ApiOperation<{
  experienceNames: string[];
  knowledgeName: string;
  knowledgeSource: string;
}> = {
  name: "reflect",
  namespace: "role",
  description: DESC_REFLECT,
  parameters: z.object({
    experienceNames: z
      .array(z.string())
      .describe(
        "Names of experience files to distill (without .experience.identity.feature suffix)"
      ),
    knowledgeName: z
      .string()
      .describe(
        "Name for the resulting knowledge (used as filename, e.g. 'authentication-principles')"
      ),
    knowledgeSource: z.string().describe("Gherkin feature source text for the knowledge"),
  }),
  permission: "role",
  execute(ctx, { experienceNames, knowledgeName, knowledgeSource }) {
    const role = requireRole(ctx);
    const feature = role.reflect(experienceNames, knowledgeName, knowledgeSource);
    return next(
      `Reflected: ${experienceNames.length} experience(s) \u2192 knowledge "${feature.name}"`,
      NEXT.reflect
    );
  },
};

export const equip: ApiOperation<{ skillName: string }> = {
  name: "equip",
  namespace: "role",
  description:
    "Equip a skill to the current role \u2014 gain the capability.\n\nThe skill must exist (created via createSkill). Once equipped, the skill's content is injected into the role's identity.",
  parameters: z.object({
    skillName: z.string().describe("Skill name to equip"),
  }),
  permission: "nuwa",
  execute(ctx, { skillName }) {
    requireRole(ctx);
    ctx.platform.equip(ctx.currentRoleName, skillName);
    return next(`Skill equipped: ${ctx.currentRoleName} \u2190 ${skillName}`, NEXT.equip);
  },
};

export const unequip: ApiOperation<{ skillName: string }> = {
  name: "unequip",
  namespace: "role",
  description:
    "Unequip a skill from the current role \u2014 remove the capability.\n\nThe skill remains in the system; only the role's equipment is changed.",
  parameters: z.object({
    skillName: z.string().describe("Skill name to unequip"),
  }),
  permission: "nuwa",
  execute(ctx, { skillName }) {
    requireRole(ctx);
    ctx.platform.unequip(ctx.currentRoleName, skillName);
    return next(`Skill unequipped: ${ctx.currentRoleName} \u2715 ${skillName}`, NEXT.unequip);
  },
};

/** All role operations. */
export const roleOperations = {
  identity,
  focus,
  want,
  plan,
  todo,
  achieve,
  abandon,
  finish,
  synthesize,
  reflect,
  equip,
  unequip,
} as const;
