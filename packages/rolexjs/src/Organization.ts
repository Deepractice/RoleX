/**
 * Organization — The organizational perspective.
 *
 * Manages the relationship between the org and its roles:
 * hiring, firing, teaching, and providing role access.
 */

import type { Platform, Organization as OrgInfo } from "@rolexjs/core";
import { Role } from "./Role.js";

export class Organization {
  constructor(private readonly platform: Platform) {}

  /** View organization info (name + roles). */
  info(): OrgInfo {
    return this.platform.organization();
  }

  /** Hire a role into the organization — establish CAS link. */
  hire(name: string): void {
    this.platform.hire(name);
  }

  /** Fire a role from the organization — remove CAS link. */
  fire(name: string): void {
    this.platform.fire(name);
  }

  /** Get a Role instance by name. */
  role(name: string): Role {
    return new Role(this.platform, name);
  }
}
