/**
 * Structure — the universal node of the system tree.
 *
 * Every node is a Structure:
 *   - What it is (name + description)
 *   - Where it lives (parent)
 *   - What it carries (information — Gherkin Feature source)
 *
 * Type definitions have no id (schema).
 * Runtime instances have id (assigned by runtime).
 * Every node can carry information AND have children.
 */
export interface Structure {
  /** Unique identifier, assigned by runtime for instances. */
  readonly id?: string;

  /** The structure name (e.g., "goal", "persona", "task"). */
  readonly name: string;

  /** What this structure is. */
  readonly description: string;

  /** Parent structure. null = root of the tree. */
  readonly parent: Structure | null;

  /** Gherkin Feature source text. */
  readonly information?: string;
}

/**
 * structure — declare a type of node in the system tree.
 */
export const structure = (
  name: string,
  description: string,
  parent: Structure | null,
): Structure => ({
  name,
  description,
  parent,
});
