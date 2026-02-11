/**
 * Effect — the atomic unit of system change.
 *
 * Six primitives expressed as a discriminated union:
 *
 *   add     — create information (AI input, human input, any source)
 *   read    — retrieve information from the system
 *   find    — query information by type
 *   link    — establish relation
 *   unlink  — remove relation
 *   feed    — consume input, optionally produce output (closed loop)
 *
 * Effects are data, not actions. They describe WHAT happens,
 * not HOW. An interpreter executes them.
 */
export type Effect =
  | { readonly tag: "add"; readonly type: string }
  | { readonly tag: "read"; readonly type: string }
  | { readonly tag: "find"; readonly type: string }
  | { readonly tag: "link"; readonly from: string; readonly to: string }
  | { readonly tag: "unlink"; readonly from: string; readonly to: string }
  | { readonly tag: "feed"; readonly consume: string; readonly produce?: string };

/**
 * Process — a composition of effects.
 *
 * A process is just an ordered list of effects.
 * Processes can be nested via pipe — sub-processes flatten into one.
 * A process whose feeds form a closed loop is a system.
 */
export type Process = readonly Effect[];
