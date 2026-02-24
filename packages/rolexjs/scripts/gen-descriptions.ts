/**
 * Generate descriptions/index.ts from .feature files.
 *
 * Scans namespace subdirectories under src/descriptions/ and produces
 * a TypeScript module exporting their content as two Records:
 *   - processes: per-tool descriptions from role/, individual/, org/, position/ etc.
 *   - world: framework-level instructions from world/
 *
 * Directory structure:
 *   descriptions/
 *   ├── world/         → world Record
 *   ├── role/          → processes Record
 *   ├── individual/    → processes Record
 *   ├── org/           → processes Record
 *   └── position/      → processes Record
 *
 * Usage: bun run scripts/gen-descriptions.ts
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const descDir = join(import.meta.dirname, "..", "src", "descriptions");
const outFile = join(descDir, "index.ts");

// Discover subdirectories
const dirs = readdirSync(descDir).filter((d) => statSync(join(descDir, d)).isDirectory());

const processEntries: string[] = [];
const worldEntries: string[] = [];

for (const dir of dirs.sort()) {
  const dirPath = join(descDir, dir);
  const features = readdirSync(dirPath)
    .filter((f) => f.endsWith(".feature"))
    .sort();

  for (const f of features) {
    const name = basename(f, ".feature");
    const content = readFileSync(join(dirPath, f), "utf-8").trimEnd();
    const entry = `  "${name}": ${JSON.stringify(content)},`;

    if (dir === "world") {
      worldEntries.push(entry);
    } else {
      processEntries.push(entry);
    }
  }
}

const output = `\
// AUTO-GENERATED — do not edit. Run \`bun run gen:desc\` to regenerate.

export const processes: Record<string, string> = {
${processEntries.join("\n")}
} as const;

export const world: Record<string, string> = {
${worldEntries.join("\n")}
} as const;
`;

writeFileSync(outFile, output, "utf-8");
console.log(
  `Generated descriptions/index.ts (${processEntries.length} processes, ${worldEntries.length} world features inlined)`
);
