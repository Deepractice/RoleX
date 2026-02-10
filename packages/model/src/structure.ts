/**
 * Structure — the container and organization of information.
 *
 * A structure is a named container that holds information.
 * It is the "noun" of the system — it exists, it is addressable,
 * and it organizes information into meaningful units.
 *
 * Structures do not act on their own. Processes act on structures
 * by adding or transforming information within them.
 *
 * A structure's state is not stored — it is derived from the
 * information it has accumulated.
 */

/**
 * StructureDefinition — defines a type of structure in the system.
 */
export interface StructureDefinition {
  /** The name of this structure type (e.g., "Role", "Organization"). */
  readonly name: string;

  /** Human-readable description. */
  readonly description: string;

  /** What types of information this structure can hold. */
  readonly informationTypes: readonly string[];
}
