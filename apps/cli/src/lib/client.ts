/**
 * Rolex client factory for CLI commands.
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { Rolex, bootstrap } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

const DEFAULT_ROLEX_DIR = join(homedir(), ".rolex");

export function createRolex(dir?: string): Rolex {
  const rolexDir = dir || process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
  const platform = new LocalPlatform(rolexDir);
  bootstrap(platform);
  return new Rolex(platform);
}
