/**
 * localPlatform — create a Platform backed by SQLite + local filesystem.
 *
 * Storage:
 *   {dataDir}/rolex.db — SQLite database (all state: nodes, links, prototypes, contexts)
 *
 * When dataDir is null, runs with in-memory SQLite (useful for tests).
 */

import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { drizzle } from "@deepracticex/drizzle";
import { openDatabase } from "@deepracticex/sqlite";
import { NodeProvider } from "@resourcexjs/node-provider";
import type { Platform } from "@rolexjs/core";
import type { Initializer } from "@rolexjs/system";
import { SqliteRepository } from "./SqliteRepository.js";

// ===== Config =====

export interface LocalPlatformConfig {
  /** Directory for persistent storage. Defaults to ~/.deepractice/rolex. Set to null for in-memory only. */
  dataDir?: string | null;
  /** Directory for ResourceX storage. Defaults to ~/.deepractice/resourcex. Set to null to disable. */
  resourceDir?: string | null;
  /** Prototype sources to settle on genesis. */
  bootstrap?: string[];
}

// ===== Factory =====

/** Resolve the DEEPRACTICE_HOME base directory. Env > default (~/.deepractice). */
function deepracticeHome(): string {
  return process.env.DEEPRACTICE_HOME ?? join(homedir(), ".deepractice");
}

/** Create a local Platform. Persistent by default ($DEEPRACTICE_HOME/rolex), in-memory if dataDir is null. */
export function localPlatform(config: LocalPlatformConfig = {}): Platform {
  const dataDir =
    config.dataDir === null ? undefined : (config.dataDir ?? join(deepracticeHome(), "rolex"));

  // ===== SQLite database =====

  let dbPath: string;
  if (dataDir) {
    mkdirSync(dataDir, { recursive: true });
    dbPath = join(dataDir, "rolex.db");
  } else {
    dbPath = ":memory:";
  }

  const rawDb = openDatabase(dbPath);
  const db = drizzle(rawDb);

  // ===== Repository (all state in one place) =====

  const repository = new SqliteRepository(db);

  // ===== ResourceX Provider =====

  const resourcexProvider = config.resourceDir !== null ? new NodeProvider() : undefined;

  // ===== Initializer =====

  const initializer: Initializer = {
    async bootstrap() {},
  };

  return {
    repository,
    resourcexProvider,
    initializer,
    bootstrap: config.bootstrap,
  };
}
