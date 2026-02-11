/**
 * @rolexjs/local-platform
 *
 * Local filesystem implementation of Platform.
 * Individual system only — stores roles in .rolex/ directories.
 */

import { join } from "node:path";
import { homedir } from "node:os";

export { LocalPlatform } from "./LocalPlatform.js";

/** Default data directory: ~/.deepractice/rolex */
export const DEFAULT_ROLEX_DIR = join(homedir(), ".deepractice", "rolex");

/** Resolve the RoleX data directory: explicit > env > default. */
export function resolveDir(dir?: string): string {
  return dir || process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
}
