/**
 * RoleX client factory for CLI commands.
 *
 * Default data directory: .deepractice/rolex/ (under cwd or home)
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { createRolex } from "rolexjs";
import type { Rolex } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";

const DEFAULT_ROLEX_DIR = join(homedir(), ".deepractice", "rolex");

export function createClient(dir?: string): Rolex {
  const rolexDir = dir || process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
  const platform = new LocalPlatform(rolexDir);
  return createRolex({ platform });
}
