/**
 * Role Resource Type
 * Define role as a ResourceX resource type
 * @rolexjs/core
 */

import { parseRXL, createRXC, type RXR, type ResourceType } from "resourcexjs";
import { loadRoleSimple } from "~/loader/index.js";
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
 * registry.supportType(roleType);
 *
 * const resource = await registry.resolve('deepractice.dev/nuwa.role@1.0.0');
 * const role = await resource.execute();
 * console.log(role.prompt);
 * ```
 */
export const roleType: ResourceType<void, RenderedRole> = {
  name: "role",
  aliases: ["ai-role", "agent-role"],
  description: "AI Agent Role",

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
      return {
        resource: rxr,
        execute: async () => loadRoleSimple(rxr),
        schema: undefined,
      };
    },
  },
};
