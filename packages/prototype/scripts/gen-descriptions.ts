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

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  normal: 2,
};

function parsePriority(content: string): {
  priority: number;
  cleaned: string;
} {
  const match = content.match(/^@priority-(\w+)\s*\n/);
  if (match) {
    const level = match[1];
    return {
      priority: PRIORITY_ORDER[level] ?? PRIORITY_ORDER.normal,
      cleaned: content.slice(match[0].length),
    };
  }
  return { priority: PRIORITY_ORDER.normal, cleaned: content };
}

const processEntries: string[] = [];
const worldEntries: { name: string; priority: number; entry: string }[] = [];

for (const dir of dirs.sort()) {
  const dirPath = join(descDir, dir);
  const features = readdirSync(dirPath)
    .filter((f) => f.endsWith(".feature"))
    .sort();

  for (const f of features) {
    const name = basename(f, ".feature");
    const raw = readFileSync(join(dirPath, f), "utf-8").trimEnd();

    if (dir === "world") {
      const { priority, cleaned } = parsePriority(raw);
      const entry = `  "${name}": ${JSON.stringify(cleaned)},`;
      worldEntries.push({ name, priority, entry });
    } else {
      const entry = `  "${name}": ${JSON.stringify(raw)},`;
      processEntries.push(entry);
    }
  }
}

// Sort world entries by priority (critical first), then alphabetically
worldEntries.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

const output = `\
// AUTO-GENERATED — do not edit. Run \`bun run gen:desc\` to regenerate.

export const processes: Record<string, string> = {
${processEntries.join("\n")}
} as const;

export const world: Record<string, string> = {
${worldEntries.map((w) => w.entry).join("\n")}
} as const;
`;

writeFileSync(outFile, output, "utf-8");
console.log(
  `Generated descriptions/index.ts (${processEntries.length} processes, ${worldEntries.length} world features inlined, priority order: ${worldEntries.map((w) => w.name).join(", ")})`
);
