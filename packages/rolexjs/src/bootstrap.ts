/**
 * bootstrap.ts — Seed a fresh Platform with 女娲 (the genesis role).
 *
 * All seed data is inlined at build time via generate-seed.ts.
 * This module has zero filesystem dependencies — pure Platform API.
 *
 * 女娲 is born at society level — she is NOT hired into any organization.
 * She exists above organizations, creating and managing them.
 */

import type { Platform } from "@rolexjs/core";
import { SEED } from "./seed.js";

/**
 * Bootstrap a Platform with seed data (女娲 + default org).
 *
 * Idempotent: skips if organization already exists.
 */
export function bootstrap(platform: Platform): void {
  try {
    platform.organization();
    return; // Already initialized
  } catch {
    // Fresh environment — seed it
  }

  platform.found(SEED.organization);

  for (const role of SEED.roles) {
    platform.born(role.name, role.persona);

    for (const dim of role.dimensions) {
      platform.growup(role.name, dim.type, dim.name, dim.source);
    }
  }
}
