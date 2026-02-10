/**
 * api/organization.ts — Organization-level API operations.
 *
 * Membership management: hire, fire, appoint, dismiss.
 * These are organizational runtime operations — who's in, who's out,
 * who does what.
 */

import { z } from "zod";
import type { ApiOperation } from "./types.js";
import { DESC_HIRE, DESC_FIRE, DESC_APPOINT, DESC_DISMISS } from "../descriptions.js";
import { next, NEXT, nextHire } from "../render.js";
import { Organization } from "../Organization.js";

export const hire: ApiOperation<{ name: string; orgName?: string }> = {
  name: "hire",
  namespace: "organization",
  description: DESC_HIRE,
  parameters: z.object({
    name: z.string().describe("Role name to hire"),
    orgName: z
      .string()
      .optional()
      .describe("Target organization name (for hire, required when multiple organizations exist)"),
  }),
  permission: "nuwa",
  execute(ctx, { name, orgName: targetOrg }) {
    const dir = ctx.rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found. Call found() first.");
    }

    let orgName: string;
    if (targetOrg) {
      orgName = targetOrg;
    } else if (dir.organizations.length === 1) {
      orgName = dir.organizations[0].name;
    } else {
      const orgNames = dir.organizations.map((o) => o.name).join(", ");
      throw new Error(
        `Multiple organizations exist (${orgNames}). Specify orgName to indicate which one.`
      );
    }

    const org = ctx.rolex.find(orgName) as Organization;
    org.hire(name);
    return next(`Role hired: ${name} \u2192 ${orgName}`, nextHire(name));
  },
};

export const fire: ApiOperation<{ name: string }> = {
  name: "fire",
  namespace: "organization",
  description: DESC_FIRE,
  parameters: z.object({
    name: z.string().describe("Role name to fire"),
  }),
  permission: "nuwa",
  execute(ctx, { name }) {
    const dir = ctx.rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found.");
    }

    const assignment = ctx.platform.getAssignment(name);
    const orgName = assignment?.org ?? dir.organizations[0].name;
    const org = ctx.rolex.find(orgName) as Organization;
    org.fire(name);
    return next(`Role fired: ${name}`, NEXT.fire);
  },
};

export const appoint: ApiOperation<{ name: string; position: string }> = {
  name: "appoint",
  namespace: "organization",
  description: DESC_APPOINT,
  parameters: z.object({
    name: z.string().describe("Role name to appoint"),
    position: z.string().describe("Position name"),
  }),
  permission: "nuwa",
  execute(ctx, { name, position }) {
    const dir = ctx.rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found.");
    }

    const assignment = ctx.platform.getAssignment(name);
    const orgName = assignment?.org ?? dir.organizations[0].name;
    const org = ctx.rolex.find(orgName) as Organization;
    org.appoint(name, position);
    return next(`Role appointed: ${name} \u2192 ${position}`, NEXT.appoint);
  },
};

export const dismiss: ApiOperation<{ name: string }> = {
  name: "dismiss",
  namespace: "organization",
  description: DESC_DISMISS,
  parameters: z.object({
    name: z.string().describe("Role name to dismiss"),
  }),
  permission: "nuwa",
  execute(ctx, { name }) {
    const dir = ctx.rolex.directory();
    if (dir.organizations.length === 0) {
      throw new Error("No organization found.");
    }

    const assignment = ctx.platform.getAssignment(name);
    const orgName = assignment?.org ?? dir.organizations[0].name;
    const org = ctx.rolex.find(orgName) as Organization;
    org.dismiss(name);
    return next(`Role dismissed: ${name}`, NEXT.dismiss);
  },
};

/** All organization operations. */
export const organizationOperations = {
  hire,
  fire,
  appoint,
  dismiss,
} as const;
