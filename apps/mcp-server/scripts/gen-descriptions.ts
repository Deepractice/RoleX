/**
 * Generate descriptions/index.ts from .feature files.
 *
 * Reads all *.feature files in src/descriptions/ and produces
 * a TypeScript module exporting their content as a Record.
 *
 * Usage: bun run scripts/gen-descriptions.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const descDir = join(import.meta.dirname, "..", "src", "descriptions");
const outFile = join(descDir, "index.ts");

const files = readdirSync(descDir)
  .filter((f) => f.endsWith(".feature"))
  .sort();

const entries = files.map((f) => {
  const name = basename(f, ".feature");
  const content = readFileSync(join(descDir, f), "utf-8").trimEnd();
  return `  ${name}: ${JSON.stringify(content)},`;
});

const output = `\
// AUTO-GENERATED — do not edit. Run \`bun run gen:desc\` to regenerate.

export const world: Record<string, string> = {
${entries.join("\n")}
} as const;
`;

writeFileSync(outFile, output, "utf-8");
console.log(`Generated descriptions/index.ts (${files.length} features inlined)`);
