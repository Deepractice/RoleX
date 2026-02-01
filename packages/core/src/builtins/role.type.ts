/**
 * Role Resource Type
 * Bundled type for AI Agent Role resources
 * This file will be bundled by build.ts
 *
 * @rolexjs/core
 */

/**
 * Rendered Role result
 */
interface RenderedRole {
  prompt: string;
  personality: string;
  principle: string;
  knowledge: string;
}

/**
 * ResolveContext from ResourceX
 */
interface ResolveContext {
  manifest: {
    registry?: string;
    path?: string;
    name: string;
    type: string;
    version: string;
  };
  files: Record<string, Uint8Array>;
}

/**
 * Extract section content from role file
 */
function extractSection(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Get file from files map, supporting with/without ./ prefix
 */
function getFile(files: Record<string, Uint8Array>, path: string): Uint8Array | undefined {
  // Try original path
  let buffer = files[path];
  if (buffer) return buffer;

  // Try with ./ prefix
  buffer = files[`./${path}`];
  if (buffer) return buffer;

  // Try without ./ prefix
  if (path.startsWith("./")) {
    buffer = files[path.slice(2)];
    if (buffer) return buffer;
  }

  return undefined;
}

/**
 * Resolve @!protocol://name references from internal files
 */
function resolveReferences(content: string, files: Record<string, Uint8Array>): string {
  let resolved = content;

  // Handle @!protocol://path format
  const oldStyleRegex = /@!([a-z]+):\/\/([a-zA-Z0-9_-]+)/g;
  resolved = resolved.replace(oldStyleRegex, (_match, protocol, name) => {
    // Try .pml suffix
    const pmlPath = `${protocol}/${name}.${protocol}.pml`;
    let fileBuffer = getFile(files, pmlPath);
    if (fileBuffer) {
      return new TextDecoder().decode(fileBuffer);
    }

    // Try .md suffix
    const mdPath = `${protocol}/${name}.${protocol}.md`;
    fileBuffer = getFile(files, mdPath);
    if (fileBuffer) {
      return new TextDecoder().decode(fileBuffer);
    }

    // File not found
    return "";
  });

  // Handle <resource src="..."/> format
  const resourceRegex = /<resource\s+src="arp:text:rxr:\/\/[^/]+\/[^/]+@[^/]+\/([^"]+)"\s*\/>/g;
  resolved = resolved.replace(resourceRegex, (_match, filePath) => {
    const fileBuffer = getFile(files, filePath);
    if (!fileBuffer) {
      return "";
    }
    return new TextDecoder().decode(fileBuffer);
  });

  return resolved.trim();
}

/**
 * Role type resolver
 */
export default {
  name: "role",
  aliases: ["ai-role", "agent-role"],
  description: "AI Agent Role",

  async resolve(ctx: ResolveContext): Promise<RenderedRole> {
    const files = ctx.files;

    // 1. Find main file (*.role.pml or *.role.md)
    const fileNames = Object.keys(files);
    let mainFileName = fileNames.find((f) => f.endsWith(".role.pml"));
    if (!mainFileName) {
      mainFileName = fileNames.find((f) => f.endsWith(".role.md"));
    }

    if (!mainFileName) {
      throw new Error("No .role.pml or .role.md file found in role resource");
    }

    const mainFileBuffer = files[mainFileName];
    if (!mainFileBuffer) {
      throw new Error(`Failed to read main file: ${mainFileName}`);
    }

    const mainContent = new TextDecoder().decode(mainFileBuffer);

    // 2. Extract three sections
    const personality = extractSection(mainContent, "personality");
    const principle = extractSection(mainContent, "principle");
    const knowledge = extractSection(mainContent, "knowledge");

    // 3. Resolve references from internal files
    const resolvedPersonality = resolveReferences(personality, files);
    const resolvedPrinciple = resolveReferences(principle, files);
    const resolvedKnowledge = resolveReferences(knowledge, files);

    // 4. Build final prompt
    const prompt = `Personality:\n${resolvedPersonality}\n\nPrinciple:\n${resolvedPrinciple}\n\nKnowledge:\n${resolvedKnowledge}`;

    return {
      personality: resolvedPersonality,
      principle: resolvedPrinciple,
      knowledge: resolvedKnowledge,
      prompt,
    };
  },
};
