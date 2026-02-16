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
import type { Runtime } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";

export interface Platform {
  /** Graph operation engine (may include transparent persistence). */
  readonly runtime: Runtime;

  /** Resource management capability (optional — requires resourcexjs). */
  readonly resourcex?: ResourceX;
}
