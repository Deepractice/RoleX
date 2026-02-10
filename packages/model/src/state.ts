/**
 * State — the current frame of the system.
 *
 * State is the complete snapshot of all information, structures,
 * and relations at a point in time. It is not stored — it is
 * produced by Process reading Structure.
 *
 *   State = Process(Structure)
 *
 * Each query process renders a named frame:
 *   identity() → cognition
 *   focus()    → intention
 *   directory() → landscape
 *
 * State is the "between" — it carries forward from one process
 * to the next. current_state + input → next_state.
 */

/**
 * StateDefinition — defines a named state (frame) in the system.
 */
export interface StateDefinition {
  /** The state/frame name (e.g., "cognition", "intention", "landscape"). */
  readonly name: string;

  /** Human-readable description. */
  readonly description: string;

  /** Which structure type this state is projected from. */
  readonly appliesTo: string;

  /** Which process produces this state. */
  readonly producedBy: string;

  /** Which information types are included in this frame. */
  readonly includes: readonly string[];
}
