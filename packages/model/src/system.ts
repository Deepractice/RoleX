/**
 * System — the continuous evolution of state through processes.
 *
 * A system is a closed chain of processes where each process
 * advances the frame: current state + input → next state.
 * The output feeds back as context for the next cycle.
 *
 * System = Loop. The system IS the loop — a continuous
 * progression of frames, where each frame builds on the last.
 *
 * Without a system, information flows linearly — created once, used once.
 * With a system, information compounds — each cycle builds on the last.
 */

/**
 * SystemDefinition — defines a named system (process cycle).
 */
export interface SystemDefinition {
  /** The system name (e.g., "goal-execution", "cognitive-growth"). */
  readonly name: string;

  /** Human-readable description. */
  readonly description: string;

  /** Ordered list of process names forming the cycle. */
  readonly processes: readonly string[];

  /** Information types that feed back from end to beginning of the cycle. */
  readonly feedback: readonly string[];
}
