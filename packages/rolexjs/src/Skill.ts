/**
 * SkillEntity — A pluggable capability module.
 *
 * Represents a standalone skill that can be equipped by any role.
 * Skills are independent of organizations and positions.
 *
 * Named SkillEntity to avoid conflict with the Skill type from core.
 */

import type { Platform, SkillInfo } from "@rolexjs/core";

export class SkillEntity {
  constructor(
    private readonly platform: Platform,
    private readonly skillName: string
  ) {}

  /** View skill info (name, equippedBy). */
  info(): SkillInfo {
    const skill = this.platform.getSkill(this.skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${this.skillName}`);
    }
    return skill;
  }
}
