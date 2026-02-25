/**
 * Prototype — external driving force that builds runtime entities.
 *
 * A prototype is a command-driven instruction list. Settling a prototype
 * pulls it from a source, executes its instructions, and registers it.
 */
import type { PrototypeInstruction } from "./instruction.js";

/** Resolves a prototype source into its instruction list. */
export interface PrototypeResolver {
  resolve(source: string): Promise<PrototypeInstruction[]>;
}

/** Registry that tracks settled prototypes. */
export interface Prototype {
  /** Settle: register a prototype — bind id to a source. */
  settle(id: string, source: string): void;

  /** List all registered prototypes: id → source mapping. */
  list(): Record<string, string>;
}
