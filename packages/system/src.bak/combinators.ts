/**
 * Combinators — pure constructors for effects + composition.
 *
 * Each combinator takes InformationType (not raw strings)
 * and returns an Effect. pipe composes effects and sub-processes.
 *
 * Usage:
 *   const goal = define("goal", "A desired outcome")
 *   const insight = define("insight", "Transferable learning")
 *
 *   const want = pipe(add(goal), link(role, goal))
 *   const achieve = pipe(feed(goal, insight))
 *   const execution = pipe(want, achieve)
 */
import type { InformationType } from "./information.js";
import type { Effect, Process } from "./effect.js";

export const add = (type: InformationType): Effect =>
  ({ tag: "add", type: type.name });

export const read = (type: InformationType): Effect =>
  ({ tag: "read", type: type.name });

export const find = (type: InformationType): Effect =>
  ({ tag: "find", type: type.name });

export const link = (from: InformationType, to: InformationType): Effect =>
  ({ tag: "link", from: from.name, to: to.name });

export const unlink = (from: InformationType, to: InformationType): Effect =>
  ({ tag: "unlink", from: from.name, to: to.name });

export const feed = (consume: InformationType, produce?: InformationType): Effect =>
  ({ tag: "feed", consume: consume.name, produce: produce?.name });

export const pipe = (...steps: (Effect | Process)[]): Process =>
  steps.flat();
