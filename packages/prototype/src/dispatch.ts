/**
 * Dispatch — schema-driven argument mapping.
 *
 * Replaces the hand-written toArgs switch in rolex.ts with a single
 * lookup against the instruction registry.
 */

import { instructions } from "./instructions.js";
import type { ArgEntry } from "./schema.js";

/**
 * Map named arguments to positional arguments for a given operation.
 *
 * @param op - Operation key in "namespace.method" format (e.g. "individual.born")
 * @param args - Named arguments from the caller
 * @returns Positional argument array matching the method signature
 */
export function toArgs(op: string, args: Record<string, unknown>): unknown[] {
  const def = instructions[op];
  if (!def) throw new Error(`Unknown instruction "${op}".`);
  return def.args.map((entry) => resolveArg(entry, args));
}

function resolveArg(entry: ArgEntry, args: Record<string, unknown>): unknown {
  if (typeof entry === "string") return args[entry];

  // pack: collect named args into an options object
  const obj: Record<string, unknown> = {};
  let hasValue = false;
  for (const name of entry.pack) {
    if (args[name] !== undefined) {
      obj[name] = args[name];
      hasValue = true;
    }
  }
  return hasValue ? obj : undefined;
}
