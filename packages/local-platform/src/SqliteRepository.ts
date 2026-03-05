/**
 * SqliteRepository — RoleXRepository backed by SQLite via Drizzle.
 *
 * Five tables: nodes, links, prototypes, contexts, prototype_migrations.
 * Schema managed by Drizzle ORM migrations.
 */

import { join } from "node:path";
import type { CommonXDatabase } from "@deepracticex/drizzle";
import { migrate } from "@deepracticex/drizzle";
import type {
  ContextData,
  MigrationRecord,
  PrototypeRepository,
  RoleXRepository,
} from "@rolexjs/core";
import type { Runtime } from "@rolexjs/system";
import { sql } from "drizzle-orm";
import { createSqliteRuntime } from "./sqliteRuntime.js";

type DB = CommonXDatabase;

// ===== Repository =====

export class SqliteRepository implements RoleXRepository {
  readonly runtime: Runtime;
  readonly prototype: PrototypeRepository;

  constructor(private db: DB) {
    // Run Drizzle migrations — handles schema creation and evolution
    migrate(db, {
      migrationsFolder: join(import.meta.dirname, "../drizzle"),
    });

    this.runtime = createSqliteRuntime(db);
    this.prototype = createPrototypeRepository(db);
  }

  async saveContext(roleId: string, data: ContextData): Promise<void> {
    this.db.run(
      sql`INSERT OR REPLACE INTO contexts (role_id, focused_goal_id, focused_plan_id)
          VALUES (${roleId}, ${data.focusedGoalId}, ${data.focusedPlanId})`
    );
  }

  async loadContext(roleId: string): Promise<ContextData | null> {
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

function createPrototypeRepository(db: DB): PrototypeRepository {
  return {
    async settle(id: string, source: string) {
      db.run(sql`INSERT OR REPLACE INTO prototypes (id, source) VALUES (${id}, ${source})`);
    },

    async evict(id: string) {
      db.run(sql`DELETE FROM prototypes WHERE id = ${id}`);
      db.run(sql`DELETE FROM prototype_migrations WHERE prototype_id = ${id}`);
    },

    async list(): Promise<Record<string, string>> {
      const rows = db.all<{ id: string; source: string }>(sql`SELECT id, source FROM prototypes`);
      const result: Record<string, string> = {};
      for (const row of rows) {
        result[row.id] = row.source;
      }
      return result;
    },

    async recordMigration(
      prototypeId: string,
      migrationId: string,
      version: number,
      checksum: string
    ) {
      const executedAt = new Date().toISOString();
      db.run(
        sql`INSERT OR REPLACE INTO prototype_migrations (prototype_id, migration_id, version, checksum, executed_at)
            VALUES (${prototypeId}, ${migrationId}, ${version}, ${checksum}, ${executedAt})`
      );
    },

    async getMigrationHistory(prototypeId: string): Promise<MigrationRecord[]> {
      return db
        .all<{
          prototype_id: string;
          migration_id: string;
          version: number;
          checksum: string;
          executed_at: string;
        }>(
          sql`SELECT prototype_id, migration_id, version, checksum, executed_at
            FROM prototype_migrations
            WHERE prototype_id = ${prototypeId}
            ORDER BY version`
        )
        .map((row) => ({
          prototypeId: row.prototype_id,
          migrationId: row.migration_id,
          version: row.version,
          checksum: row.checksum,
          executedAt: row.executed_at,
        }));
    },

    async hasMigration(prototypeId: string, migrationId: string): Promise<boolean> {
      const rows = db.all<{ cnt: number }>(
        sql`SELECT COUNT(*) as cnt FROM prototype_migrations
            WHERE prototype_id = ${prototypeId} AND migration_id = ${migrationId}`
      );
      return rows.length > 0 && rows[0].cnt > 0;
    },
  };
}
