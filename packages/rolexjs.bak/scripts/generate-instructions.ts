/**
 * generate-instructions.ts — Read instruction .feature files and generate src/instructions.ts
 *
 * Run before tsup build:
 *   bun scripts/generate-instructions.ts
 *
 * Reads all *.instruction.feature files from instructions/ directory (sorted by name),
 * concatenates their content, and generates the INSTRUCTIONS constant.
 */

import { readdirSync, readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const INSTRUCTIONS_DIR = resolve(import.meta.dirname!, "..", "instructions");
const OUTPUT = resolve(import.meta.dirname!, "..", "src", "instructions.ts");

function escapeTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

// Read all instruction feature files, sorted by name
const files = readdirSync(INSTRUCTIONS_DIR)
  .filter((f) => f.endsWith(".instruction.feature"))
  .sort();

if (files.length === 0) {
  console.error("No .instruction.feature files found in:", INSTRUCTIONS_DIR);
  process.exit(1);
}

const parts: string[] = [];
for (const file of files) {
  const content = readFileSync(join(INSTRUCTIONS_DIR, file), "utf-8").trim();
  parts.push(content);
}

const combined = parts.join("\n\n");

const lines: string[] = [
  "/**",
  " * instructions.ts — Auto-generated from .instruction.feature files. DO NOT EDIT.",
  ` * Generated from instructions/ directory at build time.`,
  ` * Source files: ${files.join(", ")}`,
  " */",
  "",
  `export const INSTRUCTIONS = \`${escapeTemplate(combined)}\`;`,
  "",
];

writeFileSync(OUTPUT, lines.join("\n"), "utf-8");
console.log(`Generated ${OUTPUT} (${files.length} instruction file(s))`);
