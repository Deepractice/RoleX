/**
 * @rolexjs/agentx-context
 *
 * RoleX ContextProvider for AgentX — bridges cognitive identity into runtime.
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

export type { RolexContextConfig } from "./rolex-context";
export { createRolexContext, RolexContext } from "./rolex-context";
export { RolexContextProvider } from "./rolex-context-provider";
