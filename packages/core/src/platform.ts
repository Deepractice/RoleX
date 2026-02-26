/**
 * Platform — external integration point for RoleX.
 *
 * A Platform provides the runtime environment that Rolex operates in.
 * Different platforms serve different deployment contexts:
 *
 *   LocalPlatform  — filesystem persistence (development, local agents)
 *   CloudPlatform  — remote storage (future)
 *
 * Platform holds the Runtime (graph engine) and will hold additional
 * services as the framework grows (auth, events, plugins, etc.).
 */
import type { Initializer, Runtime } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";

/** Serializable context data for persistence. */
export interface ContextData {
  focusedGoalId: string | null;
  focusedPlanId: string | null;
}

export interface Platform {
  /** Graph operation engine (may include transparent persistence). */
  readonly runtime: Runtime;

  /** Prototype registry — tracks which prototypes are settled. */
  readonly prototype?: {
    settle(id: string, source: string): void;
    evict(id: string): void;
    list(): Record<string, string>;
  };

  /** Resource management capability (optional — requires resourcexjs). */
  readonly resourcex?: ResourceX;

  /** Initializer — bootstrap the world on first run. */
  readonly initializer?: Initializer;

  /** Save role context to persistent storage. */
  saveContext?(roleId: string, data: ContextData): void;

  /** Load role context from persistent storage. Returns null if none exists. */
  loadContext?(roleId: string): ContextData | null;
}
