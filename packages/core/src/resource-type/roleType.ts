/**
 * Role Resource Type
 * Define role as a ResourceX resource type
 * @rolexjs/core
 */

import { parseRXL, createRXC, type RXR, type Registry, type ResourceType } from "resourcexjs";
import { loadRole } from "~/loader/index.js";
import type { RenderedRole } from "~/types.js";

/**
 * Role resource type for ResourceX integration
 *
 * @example
 * ```typescript
 * import { createRegistry } from 'resourcexjs';
 * import { roleType } from '@rolexjs/core';
 *
 * const registry = createRegistry();
 * // Register roleType with registry
 *
 * const resource = await registry.resolve('localhost/my.role@1.0.0');
 * const role = await resource.execute();
 * console.log(role.prompt);
 * ```
 */
export const roleType: ResourceType<void, RenderedRole> = {
  name: "role",
  aliases: ["ai-role", "agent-role"],
  description: "AI Agent Role (DPML-based)",

  serializer: {
    async serialize(rxr: RXR): Promise<Buffer> {
      return rxr.content.buffer();
    },

    async deserialize(data: Buffer, manifest): Promise<RXR> {
      return {
        locator: parseRXL(manifest.toLocator()),
        manifest,
        content: await createRXC({ archive: data }),
      };
    },
  },

  resolver: {
    schema: undefined,

    async resolve(rxr: RXR) {
      // Note: Registry must be provided via context when used with Registry
      // For now, we'll need to create a wrapper or use loadRole directly
      return {
        resource: rxr,
        execute: async () => {
          throw new Error(
            "roleType.resolver.resolve() requires registry context. Use loadRole(rxr, registry) directly."
          );
        },
        schema: undefined,
      };
    },
  },
};

/**
 * Create a role type instance with registry bound
 * Use this when you need to resolve roles through TypeHandlerChain
 */
export function createRoleType(registry: Registry): ResourceType<void, RenderedRole> {
  return {
    ...roleType,
    resolver: {
      schema: undefined,
      async resolve(rxr: RXR) {
        return {
          resource: rxr,
          execute: async () => loadRole(rxr, registry),
          schema: undefined,
        };
      },
    },
  };
}
