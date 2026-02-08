/**
 * Rolex — Society-level entry point.
 *
 * The broadest context: people are born, organizations are founded.
 * directory() shows who exists, find() locates anyone by name.
 *
 * Platform-agnostic — does not know how data is stored.
 * Bootstrap (seeding 女娲 etc.) is each Platform's responsibility.
 */

import type { Platform, Directory, Feature } from "@rolexjs/core";
import { Organization } from "./Organization.js";
import { Role } from "./Role.js";

export class Rolex {
  constructor(private readonly platform: Platform) {}

  /** A role is born — create a new role with its persona. */
  born(name: string, source: string) {
    return this.platform.born(name, source);
  }

  /** Found an organization. */
  found(name: string): void {
    this.platform.found(name);
  }

  /** Society directory — all born roles and organizations. */
  directory(): Directory {
    const allNames = this.platform.allBornRoles();
    const org = this.platform.organization();

    const hiredMap = new Map<string, string>();
    if (org) {
      for (const r of org.roles) {
        hiredMap.set(r.name, r.team);
      }
    }

    const roles = allNames.map((name) => ({
      name,
      team: hiredMap.get(name) ?? "",
    }));

    return {
      roles,
      organizations: org ? [{ name: org.name }] : [],
    };
  }

  /** Teach a role — transmit knowledge from the outside. */
  teach(
    name: string,
    type: "knowledge" | "experience" | "voice",
    dimensionName: string,
    source: string
  ): Feature {
    return this.platform.growup(name, type, dimensionName, source);
  }

  /** Access any born role directly — society-level, no org required. */
  role(name: string): Role {
    return new Role(this.platform, name);
  }

  /** Find a role or organization by name — searches all of society. */
  find(name: string): Role | Organization {
    const org = this.platform.organization();

    if (org && org.name === name) {
      return new Organization(this.platform);
    }

    const allNames = this.platform.allBornRoles();
    if (allNames.includes(name)) {
      return new Role(this.platform, name);
    }

    throw new Error(`Not found in society: ${name}`);
  }
}
