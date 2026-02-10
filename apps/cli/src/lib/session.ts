/**
 * CLI session — persist active role across commands.
 *
 * Mirrors MCP's in-memory state by storing activeRole in platform settings.
 * Individual commands auto-hydrate identity before executing.
 */

import { createClient } from "./client.js";
import type { Rolex } from "rolexjs";
import { LocalPlatform } from "@rolexjs/local-platform";
import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_ROLEX_DIR = join(homedir(), ".deepractice", "rolex");

function getPlatform(): LocalPlatform {
  const dir = process.env.ROLEX_DIR || DEFAULT_ROLEX_DIR;
  return new LocalPlatform(dir);
}

/** Save the active role to settings. */
export function saveActiveRole(roleId: string): void {
  const platform = getPlatform();
  platform.writeSettings({ activeRole: roleId });
}

/** Read the active role from settings. */
export function getActiveRole(): string | undefined {
  const platform = getPlatform();
  const settings = platform.readSettings();
  return settings.activeRole as string | undefined;
}

/**
 * Create a Rolex client with the active role already hydrated.
 * Throws if no role has been activated via `identity`.
 */
export async function createHydratedClient(): Promise<Rolex> {
  const roleId = getActiveRole();
  if (!roleId) {
    throw new Error("No role activated. Call identity first.");
  }
  const rolex = createClient();
  await rolex.individual.execute("identity", { roleId });
  return rolex;
}
