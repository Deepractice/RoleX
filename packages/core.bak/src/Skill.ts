/**
 * Skill — Pluggable capability module.
 *
 * A Skill IS-A Feature with type='skill'.
 * Expressed as *.skill.feature files in the skills directory.
 * Injected into role identity when the role equips the skill.
 *
 * Skills are independent of organizations and positions.
 * They can be equipped/unequipped by any born role.
 */

import type { Feature } from "./Feature.js";

/**
 * A skill (capability) that can be equipped by a role.
 */
export interface Skill extends Feature {
  readonly type: "skill";
}
