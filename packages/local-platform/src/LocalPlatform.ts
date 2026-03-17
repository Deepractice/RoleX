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
import { NodeProvider as IssueXNodeProvider } from "@issuexjs/node";
import type { Platform } from "@rolexjs/core";
import type { Initializer } from "@rolexjs/system";
import { SqliteRepository } from "./SqliteRepository.js";

// ===== Config =====

export interface LocalPlatformConfig {
  /** Directory for persistent storage. Defaults to ~/.deepractice/rolex. Set to null for in-memory only. */
  dataDir?: string | null;
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

  // ===== IssueX Provider (will be removed in Phase 2 when issue is internalized) =====

  const issuexProvider = new IssueXNodeProvider({
    db: {
      run(sql: string, ...params: unknown[]) {
        rawDb.prepare(sql).run(...params);
      },
      get<T = unknown>(sql: string, ...params: unknown[]): T | null {
        return rawDb.prepare(sql).get(...params) as T | null;
      },
      all<T = unknown>(sql: string, ...params: unknown[]): T[] {
        return rawDb.prepare(sql).all(...params) as T[];
      },
    },
  });

  // ===== Initializer =====

  const initializer: Initializer = {
    async bootstrap() {},
  };

  return {
    repository,
    issuexProvider,
    initializer,
  };
}
