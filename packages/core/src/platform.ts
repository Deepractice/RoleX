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
import type { Prototype, Runtime } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";

/** Serializable context data for persistence. */
export interface ContextData {
  focusedGoalId: string | null;
  focusedPlanId: string | null;
}

export interface Platform {
  /** Graph operation engine (may include transparent persistence). */
  readonly runtime: Runtime;

  /** Prototype source for merging base State into instances on activate. */
  readonly prototype?: Prototype;

  /** Resource management capability (optional — requires resourcexjs). */
  readonly resourcex?: ResourceX;

  /** Register a prototype: bind id to a ResourceX source (path or locator). */
  registerPrototype?(id: string, source: string): void;

  /** Save role context to persistent storage. */
  saveContext?(roleId: string, data: ContextData): void;

  /** Load role context from persistent storage. Returns null if none exists. */
  loadContext?(roleId: string): ContextData | null;
}
