/**
 * RolexContextProvider — factory for creating RolexContext instances.
 *
 * Implements AgentX ContextProvider. Pass to node-platform's contextProvider option.
 *
 * @example
 * ```typescript
 * import { localPlatform } from "@rolexjs/local-platform";
 * import { RolexContextProvider } from "@rolexjs/agentx-context";
 * import { createNodePlatform } from "@agentxjs/node-platform";
 *
 * const contextProvider = new RolexContextProvider(localPlatform({ dataDir }));
 * const platform = await createNodePlatform({ contextProvider });
 * ```
 */

import type { Context, ContextProvider } from "agentxjs";
import type { Platform } from "rolexjs";
import { RolexContext } from "./rolex-context";

export class RolexContextProvider implements ContextProvider {
  private readonly platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  async create(contextId: string): Promise<Context> {
    const ctx = new RolexContext({
      platform: this.platform,
      roleId: contextId,
    });
    await ctx.initialize();
    return ctx;
  }
}
