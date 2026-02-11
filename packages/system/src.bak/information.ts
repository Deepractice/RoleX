/**
 * InformationType — a declared information type in the system.
 *
 * define() creates these. Combinators consume them.
 * You must define before you can add, read, find, link, unlink, or feed.
 *
 * This is the vocabulary layer — what kinds of information exist.
 * Separate from the operation layer (6 primitives as Effects).
 */
export interface InformationType {
  readonly name: string;
  readonly description: string;
}

export const define = (name: string, description: string): InformationType =>
  ({ name, description });
