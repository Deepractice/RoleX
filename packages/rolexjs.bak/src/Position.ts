/**
 * Position — The duties and boundaries of a role within an organization.
 *
 * Represents WHAT a role does in their position.
 * Duties are Gherkin features that inject into role identity at runtime.
 */

import type { Platform, PositionInfo, Duty } from "@rolexjs/core";

export class Position {
  constructor(
    private readonly platform: Platform,
    private readonly positionName: string,
    private readonly orgName: string
  ) {}

  /** View position info (state, assigned role, duties). */
  info(): PositionInfo {
    const pos = this.platform.getPosition(this.positionName, this.orgName);
    if (!pos) {
      throw new Error(
        `Position "${this.positionName}" not found in organization "${this.orgName}"`
      );
    }
    return pos;
  }

  /** Get all duties for this position. */
  duties(): Duty[] {
    return this.platform.positionDuties(this.positionName, this.orgName);
  }
}
