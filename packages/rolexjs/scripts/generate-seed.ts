/**
 * generate-seed.ts — Read .rolex/ seed files and generate src/seed.ts
 *
 * Run before tsup build:
 *   bun scripts/generate-seed.ts
 *
 * Scans ALL role directories (any dir with identity/persona.identity.feature).
 * System roles (nuwa, waiter) have no organization — they are born at society level.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SEED_DIR = resolve(import.meta.dirname!, "..", ".rolex");
const OUTPUT = resolve(import.meta.dirname!, "..", "src", "seed.ts");

interface SeedRole {
  name: string;
  persona: string;
  dimensions: Array<{
    type: "knowledge" | "experience" | "voice";
    name: string;
    source: string;
  }>;
}

function detectType(filename: string): "knowledge" | "experience" | "voice" {
  if (filename.endsWith(".knowledge.identity.feature")) return "knowledge";
  if (filename.endsWith(".experience.identity.feature")) return "experience";
  if (filename.endsWith(".voice.identity.feature")) return "voice";
  return "knowledge";
}

function detectName(filename: string): string {
  return filename
    .replace(".knowledge.identity.feature", "")
    .replace(".experience.identity.feature", "")
    .replace(".voice.identity.feature", "");
}

function escapeTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

// --- Main ---

if (!existsSync(SEED_DIR)) {
  console.error("Seed directory not found:", SEED_DIR);
  process.exit(1);
}

const roles: SeedRole[] = [];

// Scan all subdirectories for roles with persona
const dirs = readdirSync(SEED_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const roleName of dirs) {
  const identityDir = join(SEED_DIR, roleName, "identity");
  if (!existsSync(identityDir)) continue;

  const files = readdirSync(identityDir)
    .filter((f) => f.endsWith(".identity.feature"))
    .sort();

  const personaFile = files.find((f) => f === "persona.identity.feature");
  if (!personaFile) continue;

  const persona = readFileSync(join(identityDir, personaFile), "utf-8");
  const dimensions: SeedRole["dimensions"] = [];

  for (const file of files) {
    if (file === "persona.identity.feature") continue;
    const source = readFileSync(join(identityDir, file), "utf-8");
    dimensions.push({
      type: detectType(file),
      name: detectName(file),
      source,
    });
  }

  roles.push({ name: roleName, persona, dimensions });
}

// Generate TypeScript source
const lines: string[] = [
  "/**",
  " * seed.ts — Auto-generated seed data. DO NOT EDIT.",
  ` * Generated from .rolex/ seed directory at build time.`,
  " */",
  "",
  "export interface SeedDimension {",
  '  type: "knowledge" | "experience" | "voice";',
  "  name: string;",
  "  source: string;",
  "}",
  "",
  "export interface SeedRole {",
  "  name: string;",
  "  persona: string;",
  "  dimensions: SeedDimension[];",
  "}",
  "",
  "export interface SeedData {",
  "  roles: SeedRole[];",
  "}",
  "",
  "export const SEED: SeedData = {",
  "  roles: [",
];

for (const role of roles) {
  lines.push("    {");
  lines.push(`      name: ${JSON.stringify(role.name)},`);
  lines.push(`      persona: \`${escapeTemplate(role.persona)}\`,`);
  lines.push("      dimensions: [");
  for (const dim of role.dimensions) {
    lines.push("        {");
    lines.push(`          type: ${JSON.stringify(dim.type)},`);
    lines.push(`          name: ${JSON.stringify(dim.name)},`);
    lines.push(`          source: \`${escapeTemplate(dim.source)}\`,`);
    lines.push("        },");
  }
  lines.push("      ],");
  lines.push("    },");
}

lines.push("  ],");
lines.push("};");
lines.push("");

writeFileSync(OUTPUT, lines.join("\n"), "utf-8");
console.log(`Generated ${OUTPUT} (${roles.length} role(s))`);
