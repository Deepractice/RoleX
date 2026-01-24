/**
 * Load Role
 * Load and render Role resources
 * @rolexjs/core
 */

import { createDPML } from "dpml";
import type { RXR, Registry } from "resourcexjs";
import { roleSchema } from "~/schema/index.js";
import { roleTransformer } from "~/transformer/index.js";
import { createResourceResolver } from "~/resolver/index.js";
import { RoleLoadError } from "~/errors.js";
import type { RenderedRole, ResourceResolver } from "~/types.js";

/**
 * Process <resource> tags in content
 * Replace <resource src="arp:..."/> with resolved content
 */
async function processResourceTags(content: string, resolver: ResourceResolver): Promise<string> {
  // Match <resource src="..."/> or <resource src="..."></resource>
  const resourceTagPattern = /<resource\s+src=["']([^"']+)["']\s*(?:\/>|><\/resource>)/g;

  const matches: Array<{ match: string; src: string }> = [];
  let match;

  while ((match = resourceTagPattern.exec(content)) !== null) {
    matches.push({ match: match[0], src: match[1] });
  }

  if (matches.length === 0) {
    return content;
  }

  // Resolve all resources in parallel
  const resolutions = await Promise.all(
    matches.map(async ({ match, src }) => {
      const resolvedContent = await resolver(src);
      return { match, resolvedContent };
    })
  );

  // Replace all resource tags
  let result = content;
  for (const { match, resolvedContent } of resolutions) {
    result = result.replace(match, resolvedContent);
  }

  return result;
}

/**
 * Load and render a Role from RXR
 *
 * @param rxr - Role resource (RXL + RXM + RXC)
 * @param registry - Registry instance (for resolving ARP rxr:// references)
 * @returns Rendered Role object
 *
 * @example
 * ```typescript
 * const registry = createRegistry();
 * const rxr = await registry.get('localhost/my.role@1.0.0');
 * const role = await loadRole(rxr, registry);
 * console.log(role.prompt);
 * ```
 */
export async function loadRole(rxr: RXR, registry: Registry): Promise<RenderedRole> {
  const files = await rxr.content.files();

  // 1. Find main file (*.role.pml or *.role.md for backward compatibility)
  let mainFileName = Array.from(files.keys()).find((f) => f.endsWith(".role.pml"));
  if (!mainFileName) {
    mainFileName = Array.from(files.keys()).find((f) => f.endsWith(".role.md"));
  }

  if (!mainFileName) {
    throw new RoleLoadError(
      "No .role.pml or .role.md file found in role resource",
      rxr.locator.toString()
    );
  }

  const mainFileBuffer = files.get(mainFileName);
  if (!mainFileBuffer) {
    throw new RoleLoadError(`Failed to read main file: ${mainFileName}`, rxr.locator.toString());
  }

  const mainContent = mainFileBuffer.toString("utf-8");

  // 2. Create resource resolver
  const resourceResolver = createResourceResolver(registry);

  // 3. Process resource tags
  const processedContent = await processResourceTags(mainContent, resourceResolver);

  // 4. Create DPML and compile
  const dpml = createDPML({
    schema: roleSchema,
    transformers: [roleTransformer],
  });

  const role = (await dpml.compile(processedContent)) as RenderedRole;

  return role;
}
