/**
 * Initializer — bootstrap the world on first run.
 *
 * Ensures built-in prototypes are settled and foundational structures
 * are created before any runtime operations.
 *
 * Idempotent: subsequent calls after initialization are no-ops.
 */

/** Bootstrap the world — settle built-in prototypes and create foundational structures. */
export interface Initializer {
  /** Run initialization if not already done. Idempotent. */
  bootstrap(): Promise<void>;
}
