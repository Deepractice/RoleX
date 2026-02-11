/**
 * RoleX client factory for CLI commands.
 */

import { createRolex } from "rolexjs";
import type { Rolex } from "rolexjs";
import { LocalPlatform, resolveDir } from "@rolexjs/local-platform";

export function createClient(dir?: string): Rolex {
  const platform = new LocalPlatform(resolveDir(dir));
  return createRolex({ platform });
}
