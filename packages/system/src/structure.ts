/**
 * Structure — the universal node of the system graph.
 *
 * Every node is a Structure:
 *   - What it is (name + description)
 *   - Where it lives (parent — tree backbone)
 *   - What it carries (information — Gherkin Feature source)
 *   - What it relates to (relations — cross-branch links)
 *
 * Tree (parent-child) provides the hierarchical backbone.
 * Relations provide cross-branch associations.
 * Together they form a graph.
 *
 * Type definitions have no ref (schema).
 * Runtime instances have ref (assigned by runtime).
 * Every node can carry information AND have children.
 *
 * Identifiers:
 *   ref   — graph engine internal reference (e.g., "n3", "e5"), assigned by runtime
 *   id    — user-facing kebab-case identifier (e.g., "sean", "build-auth")
 *   alias — alternative names for lookup (e.g., ["Sean", "姜山"])
 */

// ===== Relation =====

/** Relation — a cross-branch link type between structures. */
export interface Relation {
  /** The relation name (e.g., "appointment"). */
  readonly name: string;

  /** What this relation means. */
  readonly description: string;

  /** The target structure type this relation points to. */
  readonly target: Structure;
}

// ===== Structure =====

export interface Structure {
  /** Graph engine internal reference (e.g., "n3", "e5"), assigned by runtime. */
  readonly ref?: string;

  /** User-facing kebab-case identifier (e.g., "sean", "build-auth"). */
  readonly id?: string;

  /** Alternative names for lookup (e.g., ["Sean", "姜山"]). */
  readonly alias?: readonly string[];

  /** The structure name (e.g., "goal", "persona", "task"). */
  readonly name: string;

  /** What this structure is. */
  readonly description: string;

  /** Parent structure. null = root of the graph. */
  readonly parent: Structure | null;

  /** Gherkin Feature source text. */
  readonly information?: string;

  /** Relations to other structure types (cross-branch links). */
  readonly relations?: readonly Relation[];

  /** Generic label (e.g., "done", "abandoned"). */
  readonly tag?: string;
}

// ===== Constructors =====

/**
 * relation — declare a cross-branch link type.
 */
export const relation = (name: string, description: string, target: Structure): Relation => ({
  name,
  description,
  target,
});

/**
 * structure — declare a type of node in the system graph.
 */
export const structure = (
  name: string,
  description: string,
  parent: Structure | null,
  relations?: Relation[]
): Structure => ({
  name,
  description,
  parent,
  ...(relations ? { relations } : {}),
});
