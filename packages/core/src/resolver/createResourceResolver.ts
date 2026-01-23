/**
 * Create Resource Resolver
 * Resolve resource references via ARP protocol
 * @rolexjs/core
 */

import { createARP } from "resourcexjs/arp";
import { RxrTransport } from "resourcexjs/arp";
import type { Registry } from "resourcexjs";
import type { ResourceResolver } from "~/types.js";
import { ResourceResolveError } from "~/errors.js";

/**
 * Create a resource resolver function
 *
 * @param registry - Registry instance (required for RxrTransport)
 * @returns Resource resolver function that accepts ARP URLs
 *
 * @example
 * ```typescript
 * const resolver = createResourceResolver(registry);
 * const content = await resolver('arp:text:rxr://localhost/my.role@1.0.0/thought/first.thought.md');
 * ```
 */
export function createResourceResolver(registry: Registry): ResourceResolver {
  return async (src: string): Promise<string> => {
    // 1. Validate ARP format
    if (!src.startsWith("arp:")) {
      throw new ResourceResolveError(
        `Resource must use ARP format. Expected: arp:semantic:transport://location, got: ${src}`,
        src
      );
    }

    // 2. Create ARP instance with RxrTransport
    const arp = createARP();
    arp.registerTransport(new RxrTransport(registry));

    // 3. Parse and resolve
    try {
      const arl = arp.parse(src);
      const resource = await arl.resolve();

      // 4. Convert to string
      if (typeof resource.content === "string") {
        return resource.content;
      }

      if (Buffer.isBuffer(resource.content)) {
        return resource.content.toString("utf-8");
      }

      throw new ResourceResolveError(`Unexpected resource content type for: ${src}`, src);
    } catch (error) {
      if (error instanceof ResourceResolveError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new ResourceResolveError(`Failed to resolve resource: ${message}`, src);
    }
  };
}
