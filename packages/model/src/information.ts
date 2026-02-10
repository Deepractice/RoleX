/**
 * Information — the fundamental element of the system.
 *
 * Everything in the system is information. Information is immutable
 * and accumulative — it is added, never mutated. State itself is
 * just a projection of accumulated information.
 *
 * In RoleX, all information is encoded as Gherkin Feature files.
 */

/**
 * InformationType — defines a category of information.
 *
 * Each type describes what kind of content it represents
 * and which structure type can hold it.
 */
export interface InformationType {
  /** The semantic type (e.g., "persona", "knowledge", "duty", "skill"). */
  readonly type: string;

  /** Human-readable description. */
  readonly description: string;

  /** Which structure type holds this information. */
  readonly belongsTo: string;
}
