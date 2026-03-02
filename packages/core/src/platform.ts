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
import type { ResourceX } from "resourcexjs";

/** Serializable context data for persistence. */
export interface ContextData {
  focusedGoalId: string | null;
  focusedPlanId: string | null;
}

/** Prototype registry — tracks which prototypes are settled. */
export interface PrototypeRegistry {
  settle(id: string, source: string): void;
  evict(id: string): void;
  list(): Record<string, string>;
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
  saveContext(roleId: string, data: ContextData): void;

  /** Load role context from persistent storage. Returns null if none exists. */
  loadContext(roleId: string): ContextData | null;
}

export interface Platform {
  /** Unified data access layer — graph, prototypes, contexts. */
  readonly repository: RoleXRepository;

  /** Resource management capability (optional — requires resourcexjs). */
  readonly resourcex?: ResourceX;

  /** Initializer — bootstrap the world on first run. */
  readonly initializer?: Initializer;

  /** Prototype sources to settle on genesis (local paths or ResourceX locators). */
  readonly bootstrap?: readonly string[];
}
