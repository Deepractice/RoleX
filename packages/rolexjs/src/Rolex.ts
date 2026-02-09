/**
 * Rolex — Society-level entry point.
 *
 * The broadest context: people are born, organizations are founded,
 * positions are established.
 *
 * Three-entity architecture:
 *   Role         = WHO  (identity, goals)
 *   Organization = WHERE (structure, nesting)
 *   Position     = WHAT  (duties, boundaries)
 *
 * Platform-agnostic — does not know how data is stored.
 * Bootstrap (seeding 女娲 etc.) is each Platform's responsibility.
 */

import type { Platform, Directory, Feature } from "@rolexjs/core";
import { getRoleState } from "@rolexjs/core";
import { Organization } from "./Organization.js";
import { Role } from "./Role.js";
import { Position } from "./Position.js";

export class Rolex {
  constructor(private readonly platform: Platform) {}

  /** A role is born — create a new role with its persona. */
  born(name: string, source: string) {
    return this.platform.born(name, source);
  }

  /** Found an organization, optionally with description and parent. */
  found(name: string, source?: string, parent?: string): void {
    this.platform.found(name, source, parent);
  }

  /** Establish a position within an organization. */
  establish(positionName: string, source: string, orgName: string): void {
    this.platform.establish(positionName, source, orgName);
  }

  /** Society directory — all born roles with states, orgs with positions. */
  directory(): Directory {
    const allNames = this.platform.allBornRoles();
    const orgs = this.platform.allOrganizations();

    const roles = allNames.map((name) => {
      const assignment = this.platform.getAssignment(name);
      return {
        name,
        state: getRoleState(assignment),
        org: assignment?.org,
        position: assignment?.position,
      };
    });

    return {
      roles,
      organizations: orgs,
    };
  }

  /** Teach a role — transmit knowledge from the outside. */
  teach(
    name: string,
    type: "knowledge" | "experience" | "voice",
    dimensionName: string,
    source: string
  ): Feature {
    return this.platform.addIdentity(name, type, dimensionName, source);
  }

  /** Access any born role directly — society-level, no org required. */
  role(name: string): Role {
    return new Role(this.platform, name);
  }

  /** Find a role, organization, or position by name — searches all of society. */
  find(name: string): Role | Organization | Position {
    // Check organizations
    const org = this.platform.getOrganization(name);
    if (org) {
      return new Organization(this.platform, name);
    }

    // Check roles
    const allNames = this.platform.allBornRoles();
    if (allNames.includes(name)) {
      return new Role(this.platform, name);
    }

    // Check positions (search all orgs)
    const allOrgs = this.platform.allOrganizations();
    for (const orgInfo of allOrgs) {
      if (orgInfo.positions.includes(name)) {
        return new Position(this.platform, name, orgInfo.name);
      }
    }

    throw new Error(`Not found in society: ${name}`);
  }
}
