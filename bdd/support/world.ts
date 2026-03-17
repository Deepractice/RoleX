/**
 * Unified BDD World — test context for all RoleX BDD tests.
 *
 * Each scenario gets a fresh World instance with in-process RoleX.
 */

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { After, setWorldConstructor, World } from "@deepracticex/bdd";
import { localPlatform } from "@rolexjs/local-platform";
import type { Role, RoleXBuilder } from "rolexjs";
import { createRoleX } from "rolexjs";

// ========== World ==========

export class BddWorld extends World {
  // --- Rolex layer ---
  dataDir?: string;
  rolex?: RoleXBuilder;
  role?: Role;
  directResult?: string;
  directRaw?: any;

  // --- Prototype migration layer ---
  protoMigrations?: Record<string, Array<{ file: string; ops: unknown[] }>>;
  settleResult?: string;

  // --- Shared ---
  error?: Error;

  /** Initialize Rolex with a temp data directory for persistence tests. */
  async initRolex(): Promise<void> {
    this.dataDir = join(tmpdir(), `rolex-bdd-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(this.dataDir, { recursive: true });
    this.rolex = createRoleX({
      platform: localPlatform({ dataDir: this.dataDir }),
    });
  }

  /** Write persisted context directly via repository (simulate a previous session). */
  async writeContext(roleId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.rolex) throw new Error("Call initRolex() first");
    const { service } = await this.rolex._internal();
    await (service as any).repo.saveContext(roleId, data);
  }

  /** Re-create Rolex instance (simulate new session with same dataDir). */
  async newSession(): Promise<void> {
    if (!this.dataDir) throw new Error("Call initRolex() first");
    this.rolex = createRoleX({
      platform: localPlatform({ dataDir: this.dataDir }),
    });
  }
}

After(function (this: BddWorld) {
  if (this.dataDir && existsSync(this.dataDir)) {
    rmSync(this.dataDir, { recursive: true });
  }
});

setWorldConstructor(BddWorld);
