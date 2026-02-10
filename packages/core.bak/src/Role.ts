/**
 * Role — The primary organizing unit in RDD.
 *
 * Every role operates through dimensions:
 * Identity → Goal → Plan → Task/Skill
 *
 * Identity is static (always present).
 * Goals are dynamic (change per phase).
 */

import type { Identity } from "./Identity.js";
import type { Goal } from "./Goal.js";

/**
 * A role in the RDD (Role-Driven Development) model.
 */
export interface Role {
  readonly name: string;
  readonly identity: Identity;
  readonly goals: Goal[];
}
