/**
 * Create Resource Resolver
 * Resolve resource references via ARP protocol
 * @rolexjs/core
 */

import { createARP } from "resourcexjs/arp";
import type { ResourceResolver } from "~/types.js";
import { ResourceResolveError } from "~/errors.js";

/**
 * Create a resource resolver function
 *
 * Uses ARP with RxrTransport to resolve resource references.
 * RxrTransport automatically accesses local/cached resources.
 *
 * @returns Resource resolver function that accepts ARP URLs
 *
 * @example
 * ```typescript
 * const resolver = createResourceResolver();
 * const content = await resolver('arp:text:rxr://localhost/my.role@1.0.0/thought/first.thought.md');
 * ```
 */
export function createResourceResolver(): ResourceResolver {
  return async (src: string): Promise<string> => {
    // 1. Validate ARP format
    if (!src.startsWith("arp:")) {
      throw new ResourceResolveError(
        `Resource must use ARP format. Expected: arp:semantic:transport://location, got: ${src}`,
        src
      );
    }

    // 2. Create ARP instance (RxrTransport is auto-registered)
    const arp = createARP();

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
