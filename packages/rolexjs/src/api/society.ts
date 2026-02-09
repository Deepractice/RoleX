/**
 * api/society.ts — Society-level API operations.
 *
 * Creation and establishment: born, found, establish, teach, directory.
 * These are the founding acts of society — creating roles, organizations,
 * positions, skills, and transmitting knowledge.
 */

import { z } from "zod";
import type { ApiOperation } from "./types.js";
import {
  DESC_BORN,
  DESC_FOUND,
  DESC_ESTABLISH,
  DESC_TEACH,
  DESC_DIRECTORY,
  DESC_SKILL,
} from "../descriptions.js";
import { next, NEXT, renderFeatures } from "../render.js";
import { Organization } from "../Organization.js";
import { Position } from "../Position.js";
import { SkillEntity } from "../Skill.js";
import type { Role } from "../Role.js";

export const born: ApiOperation<{ name: string; source: string }> = {
  name: "born",
  namespace: "society",
  description: DESC_BORN,
  parameters: z.object({
    name: z.string().describe("Role name (e.g. 'sean')"),
    source: z.string().describe("Gherkin persona feature source"),
  }),
  permission: "nuwa",
  execute(ctx, { name, source }) {
    const feature = ctx.rolex.born(name, source);
    return next(`Role born: ${feature.name}`, NEXT.born);
  },
};

export const found: ApiOperation<{ name: string; source?: string; parent?: string }> = {
  name: "found",
  namespace: "society",
  description: DESC_FOUND,
  parameters: z.object({
    name: z.string().describe("Organization name"),
    source: z
      .string()
      .optional()
      .describe("Optional Gherkin feature describing the organization's purpose"),
    parent: z.string().optional().describe("Parent organization name (for nesting)"),
  }),
  permission: "nuwa",
  execute(ctx, { name, source, parent }) {
    ctx.rolex.found(name, source, parent);
    return next(`Organization founded: ${name}`, NEXT.found);
  },
};

export const establish: ApiOperation<{
  name: string;
  source: string;
  orgName: string;
}> = {
  name: "establish",
  namespace: "society",
  description: DESC_ESTABLISH,
  parameters: z.object({
    name: z.string().describe("Position name"),
    source: z.string().describe("Gherkin duty feature source"),
    orgName: z.string().describe("Organization name"),
  }),
  permission: "nuwa",
  execute(ctx, { name, source, orgName }) {
    ctx.rolex.establish(name, source, orgName);
    return next(`Position established: ${name} in ${orgName}`, NEXT.establish);
  },
};

export const teach: ApiOperation<{
  roleId: string;
  type: "knowledge" | "experience" | "voice";
  dimensionName: string;
  source: string;
}> = {
  name: "teach",
  namespace: "society",
  description: DESC_TEACH,
  parameters: z.object({
    roleId: z.string().describe("Target role name"),
    type: z
      .enum(["knowledge", "experience", "voice"])
      .describe("Growth dimension for teach operation"),
    dimensionName: z
      .string()
      .describe("Name for the knowledge being taught (e.g. 'distributed-systems')"),
    source: z.string().describe("Gherkin feature source text"),
  }),
  permission: "nuwa",
  execute(ctx, { roleId, type, dimensionName, source }) {
    const feature = ctx.rolex.teach(roleId, type, dimensionName, source);
    return next(`Taught ${type}: ${feature.name}`, NEXT.teach);
  },
};

export const createSkill: ApiOperation<{ name: string; source: string }> = {
  name: "createSkill",
  namespace: "society",
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

export const directory: ApiOperation<{ name?: string }> = {
  name: "directory",
  namespace: "society",
  description: DESC_DIRECTORY,
  parameters: z.object({
    name: z
      .string()
      .optional()
      .describe("Role, organization, or position name to look up. If omitted, lists everything."),
  }),
  permission: "any",
  execute(ctx, { name }) {
    if (name) {
      const result = ctx.rolex.find(name);
      if (result instanceof Organization) {
        const info = result.info();
        const parentStr = info.parent ? ` (parent: ${info.parent})` : "";
        return `Organization: ${info.name}${parentStr}\nMembers: ${info.members.length}\nPositions: ${info.positions.join(", ") || "none"}`;
      }
      if (result instanceof Position) {
        const info = result.info();
        return `Position: ${info.name} in ${info.org}\nState: ${info.state}\nAssigned: ${info.assignedRole || "none"}\nDuties: ${info.duties.length}`;
      }
      if (result instanceof SkillEntity) {
        const info = result.info();
        const equipped = info.equippedBy.length > 0 ? info.equippedBy.join(", ") : "none";
        return `Skill: ${info.name}\nEquipped by: ${equipped}`;
      }
      // Must be a Role
      const features = (result as Role).identity();
      return renderFeatures(features);
    }

    const dir = ctx.rolex.directory();
    const lines: string[] = [];

    if (dir.organizations.length > 0) {
      for (const org of dir.organizations) {
        const parentStr = org.parent ? ` (parent: ${org.parent})` : "";
        lines.push(`Organization: ${org.name}${parentStr}`);

        if (org.positions.length > 0) {
          lines.push("  Positions:");
          for (const pos of org.positions) {
            const posInfo = ctx.platform.getPosition(pos, org.name);
            const holder = posInfo?.assignedRole ? ` \u2190 ${posInfo.assignedRole}` : " (vacant)";
            lines.push(`    - ${pos}${holder}`);
          }
        }

        if (org.members.length > 0) {
          lines.push("  Members:");
          for (const member of org.members) {
            const role = dir.roles.find((r) => r.name === member);
            const state = role ? ` [${role.state}]` : "";
            const pos = role?.position ? ` \u2192 ${role.position}` : "";
            lines.push(`    - ${member}${state}${pos}`);
          }
        }
      }
    }

    const freeRoles = dir.roles.filter((r) => r.state === "free");
    if (freeRoles.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("Free Roles:");
      for (const role of freeRoles) {
        lines.push(`  - ${role.name}`);
      }
    }

    if (dir.skills.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("Skills:");
      for (const skill of dir.skills) {
        const equipped =
          skill.equippedBy.length > 0 ? ` \u2190 ${skill.equippedBy.join(", ")}` : "";
        lines.push(`  - ${skill.name}${equipped}`);
      }
    }

    return lines.join("\n") || "No roles or organizations found.";
  },
};

/** All society operations. */
export const societyOperations = {
  born,
  found,
  establish,
  teach,
  createSkill,
  directory,
} as const;
