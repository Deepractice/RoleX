/**
 * Platform — external integration point for RoleX.
 *
 * A Platform provides the runtime environment that Rolex operates in.
 * Different platforms serve different deployment contexts:
 *
 *   LocalPlatform  — filesystem persistence (development, local agents)
 *   CloudPlatform  — remote storage (future)
 *
 * Platform combines a RoleXRepository (data access) with external services
 * (ResourceX, bootstrap config) to form a complete runtime environment.
 */

import type { Initializer, Runtime } from "@rolexjs/system";

/** Serializable context data for persistence. */
export interface ContextData {
  focusedGoalId: string | null;
  focusedPlanId: string | null;
}

/** A single migration within a prototype. */
export interface Migration {
  version: number;
  id: string;
  checksum: string;
  instructions: Array<{ op: string; args: Record<string, unknown> }>;
}

/** The unified prototype data structure. */
export interface PrototypeData {
  id: string;
  source: string;
  migrations: Migration[];
}

/** Migration history entry — records a single executed migration. */
export interface MigrationRecord {
  prototypeId: string;
  migrationId: string;
  version: number;
  checksum: string;
  executedAt: string;
}

/** Prototype registry — tracks which prototypes are settled and their migration history. */
export interface PrototypeRepository {
  settle(id: string, source: string): Promise<void>;
  evict(id: string): Promise<void>;
  list(): Promise<Record<string, string>>;

  /** Record a migration as executed. */
  recordMigration(
    prototypeId: string,
    migrationId: string,
    version: number,
    checksum: string
  ): Promise<void>;

  /** Get all executed migrations for a prototype, ordered by execution time. */
  getMigrationHistory(prototypeId: string): Promise<MigrationRecord[]>;

  /** Check if a specific migration has been executed. */
  hasMigration(prototypeId: string, migrationId: string): Promise<boolean>;
}

/**
 * RoleXRepository — unified data access layer.
 *
 * Encapsulates all persistent state: graph (nodes/links), prototypes, and contexts.
 * Implementations are backend-specific (SQLite, Turso, D1, etc.).
 */
export interface RoleXRepository {
  /** Graph operation engine. */
  readonly runtime: Runtime;

  /** Prototype registry — tracks which prototypes are settled. */
  readonly prototype: PrototypeRepository;

  /** Save role context to persistent storage. */
  saveContext(roleId: string, data: ContextData): Promise<void>;

  /** Load role context from persistent storage. Returns null if none exists. */
  loadContext(roleId: string): Promise<ContextData | null>;
}

export interface Platform {
  /** Unified data access layer — graph, prototypes, contexts. */
  readonly repository: RoleXRepository;

  /** Initializer — bootstrap the world on first run. */
  readonly initializer?: Initializer;
}
