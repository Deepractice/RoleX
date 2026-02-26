/**
 * localPlatform — create a Platform backed by SQLite + local filesystem.
 *
 * Storage:
 *   {dataDir}/rolex.db            — SQLite database (single source of truth for runtime graph)
 *   {dataDir}/prototype.json      — prototype registry
 *   {dataDir}/context/<id>.json   — role context persistence
 *
 * Runtime: SQLite-backed via Drizzle ORM (no in-memory Map, no load/save cycle).
 * When dataDir is null, runs with in-memory SQLite (useful for tests).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { drizzle } from "@deepracticex/drizzle";
import { openDatabase } from "@deepracticex/sqlite";
import { NodeProvider } from "@resourcexjs/node-provider";
import type { ContextData, Platform } from "@rolexjs/core";
import type { Initializer } from "@rolexjs/system";
import { sql } from "drizzle-orm";
import { createResourceX, setProvider } from "resourcexjs";
import { createSqliteRuntime } from "./sqliteRuntime.js";
import { prototypeType } from "./prototypeType.js";

// ===== Config =====

export interface LocalPlatformConfig {
  /** Directory for persistent storage. Defaults to ~/.deepractice/rolex. Set to null for in-memory only. */
  dataDir?: string | null;
  /** Directory for ResourceX storage. Defaults to ~/.deepractice/resourcex. Set to null to disable. */
  resourceDir?: string | null;
}

// ===== DDL =====

const CREATE_NODES = sql`CREATE TABLE IF NOT EXISTS nodes (
  ref TEXT PRIMARY KEY,
  id TEXT,
  alias TEXT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  parent_ref TEXT REFERENCES nodes(ref),
  information TEXT,
  tag TEXT
)`;

const CREATE_LINKS = sql`CREATE TABLE IF NOT EXISTS links (
  from_ref TEXT NOT NULL REFERENCES nodes(ref),
  to_ref TEXT NOT NULL REFERENCES nodes(ref),
  relation TEXT NOT NULL,
  PRIMARY KEY (from_ref, to_ref, relation)
)`;

const CREATE_INDEXES = [
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_id ON nodes(id)`,
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name)`,
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_parent_ref ON nodes(parent_ref)`,
  sql`CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_ref)`,
  sql`CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_ref)`,
];

// ===== Factory =====

/** Create a local Platform. Persistent by default (~/.deepractice/rolex), in-memory if dataDir is null. */
export function localPlatform(config: LocalPlatformConfig = {}): Platform {
  const dataDir =
    config.dataDir === null
      ? undefined
      : (config.dataDir ?? join(homedir(), ".deepractice", "rolex"));

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

  // Ensure tables exist
  db.run(CREATE_NODES);
  db.run(CREATE_LINKS);
  for (const idx of CREATE_INDEXES) {
    db.run(idx);
  }

  // ===== Runtime =====

  const runtime = createSqliteRuntime(db);

  // ===== ResourceX =====

  let resourcex: ReturnType<typeof createResourceX> | undefined;
  if (config.resourceDir !== null) {
    setProvider(new NodeProvider());
    resourcex = createResourceX({
      path: config.resourceDir ?? join(homedir(), ".deepractice", "resourcex"),
      types: [prototypeType],
    });
  }

  // ===== Prototype registry =====

  const registryPath = dataDir ? join(dataDir, "prototype.json") : undefined;

  const readRegistry = (): Record<string, string> => {
    if (registryPath && existsSync(registryPath)) {
      return JSON.parse(readFileSync(registryPath, "utf-8"));
    }
    return {};
  };

  const writeRegistry = (registry: Record<string, string>): void => {
    if (!registryPath) return;
    mkdirSync(dataDir!, { recursive: true });
    writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf-8");
  };

  const prototype = {
    settle(id: string, source: string) {
      const registry = readRegistry();
      registry[id] = source;
      writeRegistry(registry);
    },

    evict(id: string) {
      const registry = readRegistry();
      delete registry[id];
      writeRegistry(registry);
    },

    list(): Record<string, string> {
      return readRegistry();
    },
  };

  // ===== Initializer =====

  const initializer: Initializer = {
    async bootstrap() {},
  };

  // ===== Context persistence =====

  const saveContext = (roleId: string, data: ContextData): void => {
    if (!dataDir) return;
    const contextDir = join(dataDir, "context");
    mkdirSync(contextDir, { recursive: true });
    writeFileSync(join(contextDir, `${roleId}.json`), JSON.stringify(data, null, 2), "utf-8");
  };

  const loadContext = (roleId: string): ContextData | null => {
    if (!dataDir) return null;
    const contextPath = join(dataDir, "context", `${roleId}.json`);
    if (!existsSync(contextPath)) return null;
    return JSON.parse(readFileSync(contextPath, "utf-8"));
  };

  return { runtime, prototype, resourcex, initializer, saveContext, loadContext };
}
