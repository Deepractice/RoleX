/**
 * Generate directives/index.ts from .feature files.
 *
 * Parses Gherkin to extract Scenario names and step text.
 * Produces a nested Record: topic → scenario → directive text.
 *
 * Directory structure:
 *   directives/
 *   ├── identity-ethics.feature  → directives["identity-ethics"]["on-unknown-command"]
 *   └── ...
 *
 * Usage: bun run scripts/gen-directives.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "@rolexjs/parser";

const directivesDir = join(import.meta.dirname, "..", "src", "directives");
const outFile = join(directivesDir, "index.ts");

const features = readdirSync(directivesDir)
  .filter((f) => f.endsWith(".feature"))
  .sort();

const topicEntries: string[] = [];

for (const f of features) {
  const topic = basename(f, ".feature");
  const source = readFileSync(join(directivesDir, f), "utf-8");
  const doc = parse(source);

  if (!doc.feature) continue;

  const scenarioEntries: string[] = [];

  for (const child of doc.feature.children) {
    const scenario = child.scenario;
    if (!scenario) continue;

    const name = scenario.name.trim();
    const lines = scenario.steps.map((step) => step.text.trim());
    const text = lines.join("\n");

    scenarioEntries.push(`    "${name}": ${JSON.stringify(text)},`);
  }

  topicEntries.push(`  "${topic}": {\n${scenarioEntries.join("\n")}\n  },`);
}

const output = `\
// AUTO-GENERATED — do not edit. Run \`bun run gen:directives\` to regenerate.

export const directives: Record<string, Record<string, string>> = {
${topicEntries.join("\n")}
} as const;
`;

writeFileSync(outFile, output, "utf-8");
console.log(
  `Generated directives/index.ts (${features.length} topics, ${topicEntries.length} entries)`
);
