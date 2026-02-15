/**
 * Role projection — activating a role loads cognition into context.
 *
 * A role is not a Structure — it is a State (projection).
 * What to load is defined by the upper layer.
 */
import { process } from "@rolexjs/system";
import { individual } from "./structures.js";

export const activate = process(
  "activate",
  "Activate a role — load cognition into context",
  individual
);
