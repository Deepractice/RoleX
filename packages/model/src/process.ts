/**
 * Process — the transformation of information.
 *
 * A process adds, transforms, or relates information within structures.
 * It is the "verb" of the system — the only way information changes.
 *
 * Processes are categorized by what they do to information:
 * - create:    bring a new structure into existence with initial information
 * - write:     add information to an existing structure
 * - transform: convert one type of information into another
 * - relate:    establish or remove a relationship between structures
 * - query:     read information without changing anything
 */

/** The kind of information change a process performs. */
export type ProcessKind = "create" | "write" | "transform" | "relate" | "query";

/**
 * ProcessDefinition — defines a named process in the system.
 */
export interface ProcessDefinition {
  /** The process name (e.g., "born", "hire", "teach", "synthesize"). */
  readonly name: string;

  /** Human-readable description. */
  readonly description: string;

  /** What kind of information change this process performs. */
  readonly kind: ProcessKind;

  /** Which structure type(s) this process operates on. */
  readonly targets: readonly string[];

  /** Information types this process reads as input. */
  readonly inputs: readonly string[];

  /** Information types this process produces as output. */
  readonly outputs: readonly string[];

  /** Information types this process consumes (removed from active state). */
  readonly consumes?: readonly string[];
}
