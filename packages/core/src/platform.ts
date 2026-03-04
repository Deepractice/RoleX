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

import type { IssueXProvider } from "@issuexjs/core";
import type { CustomExecutor, ResourceXProvider } from "@resourcexjs/core";
import type { Initializer, Runtime } from "@rolexjs/system";

/** Serializable context data for persistence. */
export interface ContextData {
  focusedGoalId: string | null;
  focusedPlanId: string | null;
}

/** Migration history entry — records a single executed migration. */
export interface MigrationRecord {
  prototypeId: string;
  migrationId: string;
  checksum: string;
  executedAt: string;
}

/** Prototype registry — tracks which prototypes are settled and their migration history. */
export interface PrototypeRegistry {
  settle(id: string, source: string): void;
  evict(id: string): void;
  list(): Record<string, string>;

  /** Record a migration as executed. */
  recordMigration(prototypeId: string, migrationId: string, checksum: string): void;

  /** Get all executed migrations for a prototype, ordered by execution time. */
  getMigrationHistory(prototypeId: string): MigrationRecord[];

  /** Check if a specific migration has been executed. */
  hasMigration(prototypeId: string, migrationId: string): boolean;
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
  readonly prototype: PrototypeRegistry;

  /** Save role context to persistent storage. */
  saveContext(roleId: string, data: ContextData): Promise<void>;

  /** Load role context from persistent storage. Returns null if none exists. */
  loadContext(roleId: string): Promise<ContextData | null>;
}

export interface Platform {
  /** Unified data access layer — graph, prototypes, contexts. */
  readonly repository: RoleXRepository;

  /** ResourceX provider — injected storage backend for resource management. */
  readonly resourcexProvider?: ResourceXProvider;

  /** Custom executor for ResourceX resolver execution (e.g., QuickJS Wasm for Workers). */
  readonly resourcexExecutor?: CustomExecutor;

  /** IssueX provider — injected storage backend for issue tracking. */
  readonly issuexProvider?: IssueXProvider;

  /** Initializer — bootstrap the world on first run. */
  readonly initializer?: Initializer;

  /** Prototype sources to settle on genesis (local paths or ResourceX locators). */
  readonly bootstrap?: readonly string[];
}
