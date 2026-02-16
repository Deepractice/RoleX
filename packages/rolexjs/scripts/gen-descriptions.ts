/**
 * Generate descriptions/index.ts from .feature files.
 *
 * Reads all *.feature files in src/descriptions/ and produces
 * a TypeScript module exporting their content as two Records:
 *   - processes: per-tool descriptions (activate, want, plan, etc.)
 *   - world: framework-level instructions (world-*.feature files)
 *
 * Usage: bun run scripts/gen-descriptions.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const descDir = join(import.meta.dirname, "..", "src", "descriptions");
const outFile = join(descDir, "index.ts");

const files = readdirSync(descDir)
  .filter((f) => f.endsWith(".feature"))
  .sort();

const processFiles = files.filter((f) => !f.startsWith("world-"));
const worldFiles = files.filter((f) => f.startsWith("world-"));

const toEntries = (list: string[], stripPrefix?: string) =>
  list.map((f) => {
    let name = basename(f, ".feature");
    if (stripPrefix && name.startsWith(stripPrefix)) {
      name = name.slice(stripPrefix.length);
    }
    const content = readFileSync(join(descDir, f), "utf-8").trimEnd();
    return `  "${name}": ${JSON.stringify(content)},`;
  });

const output = `\
// AUTO-GENERATED — do not edit. Run \`bun run gen:desc\` to regenerate.

export const processes: Record<string, string> = {
${toEntries(processFiles).join("\n")}
} as const;

export const world: Record<string, string> = {
${toEntries(worldFiles, "world-").join("\n")}
} as const;
`;

writeFileSync(outFile, output, "utf-8");
console.log(
  `Generated descriptions/index.ts (${processFiles.length} processes, ${worldFiles.length} world features inlined)`
);
