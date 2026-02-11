/**
 * @rolexjs/system — Pure Functional System Definition
 *
 * Two layers:
 *   define          — declare information types (vocabulary)
 *   add, read, find, link, unlink, feed — 6 primitives (operations)
 *
 * Effects are data. Processes compose effects via pipe.
 * A process with a feedback cycle is a system.
 *
 * No runtime, no graph, no I/O — pure functions, pure data.
 */

export type { InformationType } from "./information.js";
export { define } from "./information.js";

export type { Effect, Process } from "./effect.js";
export { add, read, find, link, unlink, feed, pipe } from "./combinators.js";
