/**
 * bootstrap.ts — Seed a fresh Platform with system roles (女娲 + 小二).
 *
 * All seed data is inlined at build time via generate-seed.ts.
 * This module has zero filesystem dependencies — pure Platform API.
 *
 * System roles are born at society level — they are NOT hired into any organization.
 * Organizations are created by users via found().
 */

import type { Platform } from "@rolexjs/core";
import { SEED } from "./seed.js";

/**
 * Bootstrap a Platform with seed data (system roles only).
 *
 * Idempotent: skips roles that already exist.
 */
export function bootstrap(platform: Platform): void {
  for (const role of SEED.roles) {
    // Skip if already born
    if (platform.allBornRoles().includes(role.name)) continue;

    platform.born(role.name, role.persona);

    for (const dim of role.dimensions) {
      platform.addIdentity(role.name, dim.type, dim.name, dim.source);
    }
  }
}
