/**
 * Commands — resource.* commands.
 */

import type { Resource, RXM } from "resourcexjs";
import type { Helpers } from "./helpers.js";
import type { CommandContext } from "./types.js";

export function resourceCommands(
  _ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { requireResourceX } = helpers;

  return {
    "resource.add"(path: string): Promise<Resource> {
      return requireResourceX().add(path);
    },

    "resource.search"(query?: string): Promise<string[]> {
      return requireResourceX().search(query);
    },

    "resource.has"(locator: string): Promise<boolean> {
      return requireResourceX().has(locator);
    },

    "resource.info"(locator: string): Promise<Resource> {
      return requireResourceX().info(locator);
    },

    "resource.remove"(locator: string): Promise<void> {
      return requireResourceX().remove(locator);
    },

    "resource.push"(locator: string, options?: { registry?: string }): Promise<RXM> {
      return requireResourceX().push(locator, options);
    },

    "resource.pull"(locator: string, options?: { registry?: string }): Promise<void> {
      return requireResourceX().pull(locator, options);
    },

    "resource.clearCache"(registry?: string): Promise<void> {
      return requireResourceX().clearCache(registry);
    },
  };
}
