/**
 * Rolex client factory for CLI commands.
 */

import { Rolex, LocalPlatform } from "rolexjs";

export function createRolex(dir?: string): Rolex {
  const rolexDir = dir || process.env.ROLEX_DIR || ".rolex";
  return new Rolex(new LocalPlatform(rolexDir));
}
