/**
 * Simple Role Loader
 * Simple role loader without DPML, uses direct text replacement
 * Uses ARP stateless resource reference resolution
 */

import type { RXR } from "resourcexjs";
import { extract, format } from "resourcexjs";
import type { RenderedRole } from "~/types.js";
import { RoleLoadError } from "~/errors.js";

/**
 * Simple role loading (without DPML)
 * 1. Read files from RXR
 * 2. Parse @!protocol://path references (from internal files)
 * 3. Simple text concatenation
 */
export async function loadRoleSimple(rxr: RXR): Promise<RenderedRole> {
  const files = await extract(rxr.archive);
  const fileNames = Object.keys(files);

  // 1. Find main file
  let mainFileName = fileNames.find((f) => f.endsWith(".role.pml"));
  if (!mainFileName) {
    mainFileName = fileNames.find((f) => f.endsWith(".role.md"));
  }

  if (!mainFileName) {
    throw new RoleLoadError("No .role.pml or .role.md file found", format(rxr.locator));
  }

  const mainFileBuffer = files[mainFileName];
  if (!mainFileBuffer) {
    throw new RoleLoadError(`Failed to read main file: ${mainFileName}`, format(rxr.locator));
  }

  const mainContent = mainFileBuffer.toString("utf-8");

  // 2. Extract three sections
  const personality = extractSection(mainContent, "personality");
  const principle = extractSection(mainContent, "principle");
  const knowledge = extractSection(mainContent, "knowledge");

  // 3. Resolve references (from internal files)
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
}

/**
 * Extract section content
 */
function extractSection(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Get file from files, supporting with/without ./ prefix
 */
function getFile(files: Record<string, Buffer>, path: string): Buffer | undefined {
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
 * Resolve references and replace
 * Supports:
 * - @!thought://xxx
 * - <resource src="arp:text:rxr://domain/name@version/path/file.pml"/>
 */
function resolveReferences(content: string, files: Record<string, Buffer>): string {
  let resolved = content;

  // 1. Handle @!protocol://path format
  const oldStyleRegex = /@!([a-z]+):\/\/([a-zA-Z0-9_-]+)/g;
  resolved = resolved.replace(oldStyleRegex, (_match, protocol, name) => {
    // Try .pml suffix
    const pmlPath = `${protocol}/${name}.${protocol}.pml`;
    let fileBuffer = getFile(files, pmlPath);
    if (fileBuffer) {
      return fileBuffer.toString("utf-8");
    }

    // Try .md suffix
    const mdPath = `${protocol}/${name}.${protocol}.md`;
    fileBuffer = getFile(files, mdPath);
    if (fileBuffer) {
      return fileBuffer.toString("utf-8");
    }

    console.warn(`Referenced file not found: ${pmlPath} or ${mdPath}`);
    return "";
  });

  // 2. Handle <resource src="..."/> format
  const resourceRegex = /<resource\s+src="arp:text:rxr:\/\/[^/]+\/[^/]+@[^/]+\/([^"]+)"\s*\/>/g;
  resolved = resolved.replace(resourceRegex, (_match, filePath) => {
    const fileBuffer = getFile(files, filePath);
    if (!fileBuffer) {
      console.warn(`Referenced file not found: ${filePath}`);
      return "";
    }
    return fileBuffer.toString("utf-8");
  });

  return resolved.trim();
}
