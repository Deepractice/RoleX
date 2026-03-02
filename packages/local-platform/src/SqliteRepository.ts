/**
 * SqliteRepository — RoleXRepository backed by SQLite via Drizzle.
 *
 * Single database, four tables: nodes, links, prototypes, contexts.
 * All state in one place — swap the db connection to go from local to cloud.
 */

import type { CommonXDatabase } from "@deepracticex/drizzle";
import type { ContextData, PrototypeRegistry, RoleXRepository } from "@rolexjs/core";
import type { Runtime } from "@rolexjs/system";
import { sql } from "drizzle-orm";
import { createSqliteRuntime } from "./sqliteRuntime.js";

type DB = CommonXDatabase;

// ===== DDL =====

const DDL = [
  sql`CREATE TABLE IF NOT EXISTS nodes (
    ref TEXT PRIMARY KEY,
    id TEXT,
    alias TEXT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    parent_ref TEXT REFERENCES nodes(ref),
    information TEXT,
    tag TEXT
  )`,
  sql`CREATE TABLE IF NOT EXISTS links (
    from_ref TEXT NOT NULL REFERENCES nodes(ref),
    to_ref TEXT NOT NULL REFERENCES nodes(ref),
    relation TEXT NOT NULL,
    PRIMARY KEY (from_ref, to_ref, relation)
  )`,
  sql`CREATE TABLE IF NOT EXISTS prototypes (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL
  )`,
  sql`CREATE TABLE IF NOT EXISTS contexts (
    role_id TEXT PRIMARY KEY,
    focused_goal_id TEXT,
    focused_plan_id TEXT
  )`,
  // Indexes
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_id ON nodes(id)`,
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name)`,
  sql`CREATE INDEX IF NOT EXISTS idx_nodes_parent_ref ON nodes(parent_ref)`,
  sql`CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_ref)`,
  sql`CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_ref)`,
];

// ===== Repository =====

export class SqliteRepository implements RoleXRepository {
  readonly runtime: Runtime;
  readonly prototype: PrototypeRegistry;

  constructor(private db: DB) {
    // Ensure all tables exist
    for (const stmt of DDL) {
      db.run(stmt);
    }

    this.runtime = createSqliteRuntime(db);
    this.prototype = createPrototypeRegistry(db);
  }

  saveContext(roleId: string, data: ContextData): void {
    this.db.run(
      sql`INSERT OR REPLACE INTO contexts (role_id, focused_goal_id, focused_plan_id)
          VALUES (${roleId}, ${data.focusedGoalId}, ${data.focusedPlanId})`
    );
  }

  loadContext(roleId: string): ContextData | null {
    const row = this.db.all<{
      role_id: string;
      focused_goal_id: string | null;
      focused_plan_id: string | null;
    }>(
      sql`SELECT role_id, focused_goal_id, focused_plan_id FROM contexts WHERE role_id = ${roleId}`
    );
    if (row.length === 0) return null;
    return {
      focusedGoalId: row[0].focused_goal_id,
      focusedPlanId: row[0].focused_plan_id,
    };
  }
}

// ===== Prototype Registry (SQLite-backed) =====

function createPrototypeRegistry(db: DB): PrototypeRegistry {
  return {
    settle(id: string, source: string) {
      db.run(sql`INSERT OR REPLACE INTO prototypes (id, source) VALUES (${id}, ${source})`);
    },

    evict(id: string) {
      db.run(sql`DELETE FROM prototypes WHERE id = ${id}`);
    },

    list(): Record<string, string> {
      const rows = db.all<{ id: string; source: string }>(sql`SELECT id, source FROM prototypes`);
      const result: Record<string, string> = {};
      for (const row of rows) {
        result[row.id] = row.source;
      }
      return result;
    },
  };
}
