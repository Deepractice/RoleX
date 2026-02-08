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

  /** Society directory — all roles and organizations. */
  directory(): Directory {
    const org = this.platform.organization();
    return {
      roles: org.roles,
      organizations: [{ name: org.name }],
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

  /** Find a role or organization by name. */
  find(name: string): Role | Organization {
    const org = this.platform.organization();

    if (org.name === name) {
      return new Organization(this.platform);
    }

    const role = org.roles.find((r) => r.name === name);
    if (role) {
      return new Role(this.platform, role.name);
    }

    throw new Error(`Not found in society: ${name}`);
  }
}
