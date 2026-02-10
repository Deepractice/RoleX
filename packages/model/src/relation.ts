/**
 * Relation — the connection between structures.
 *
 * A relation is a link between two structures, managed by the system
 * (not by humans or AI). It is not encoded as Gherkin — it is
 * structural data maintained programmatically.
 *
 * Relations are what give a system its topology: who belongs where,
 * who holds what position, who has what capability.
 *
 * Without relations, structures are isolated islands.
 * With relations, structures form a connected society.
 */

/**
 * RelationDefinition — defines a named relation between structures.
 */
export interface RelationDefinition {
  /** The relation name (e.g., "membership", "assignment", "equipment"). */
  readonly name: string;

  /** Human-readable description. */
  readonly description: string;

  /** The source structure type. */
  readonly from: string;

  /** The target structure type. */
  readonly to: string;

  /** Cardinality constraint. */
  readonly cardinality: "one-to-one" | "one-to-many" | "many-to-many";
}
