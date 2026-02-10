/**
 * Organization — The organizational perspective.
 *
 * Manages the relationship between the org and its roles:
 * hiring, firing, appointing, dismissing, and providing role access.
 *
 * Each Organization instance is scoped to a specific org by name.
 */

import type { Platform, OrganizationInfo } from "@rolexjs/core";
import { Role } from "./Role.js";

export class Organization {
  constructor(
    private readonly platform: Platform,
    private readonly orgName: string
  ) {}

  /** View organization info (name, parent, positions, members). */
  info(): OrganizationInfo {
    const org = this.platform.getOrganization(this.orgName);
    if (!org) throw new Error(`Organization not found: ${this.orgName}`);
    return org;
  }

  /** Hire a role into the organization — establish CAS link. */
  hire(name: string): void {
    this.platform.hire(name, this.orgName);
  }

  /** Fire a role from the organization — remove CAS link. */
  fire(name: string): void {
    this.platform.fire(name, this.orgName);
  }

  /** Appoint a role to a position within this organization. */
  appoint(roleId: string, positionName: string): void {
    this.platform.appoint(roleId, positionName, this.orgName);
  }

  /** Dismiss a role from their position (back to member). */
  dismiss(roleId: string): void {
    this.platform.dismiss(roleId);
  }

  /** Get a Role instance by name. */
  role(name: string): Role {
    return new Role(this.platform, name);
  }
}
