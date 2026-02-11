/**
 * LocalPlatform — filesystem implementation of Platform<Feature>.
 *
 * New graph-based storage:
 *
 *   graph.json        → serialized graph topology (nodes + edges)
 *   content/{key}.feature → Gherkin content per node (on demand)
 *   settings.json     → global key-value settings
 *
 * Graph stores topology only. Content is loaded on demand.
 * Keys use slash notation (e.g. "sean/persona") which maps
 * to directory paths under content/.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { parse } from "@rolexjs/parser";
import type { Feature, Scenario, Platform, SerializedGraph } from "@rolexjs/core";

// ========== Gherkin Serializer ==========

function featureToGherkin(feature: Feature): string {
  const lines: string[] = [];

  // Feature-level tags
  const tags = feature.tags || [];
  if (tags.length > 0) {
    lines.push(tags.map((t: any) => t.name).join(" "));
  }

  // Feature line
  lines.push(`Feature: ${feature.name || ""}`);
  if (feature.description) {
    for (const line of feature.description.split("\n")) {
      lines.push(`  ${line.trimEnd()}`);
    }
  }

  // Children (scenarios)
  const children = (feature.children || []) as any[];
  for (const child of children) {
    if (!child.scenario) continue;
    const sc = child.scenario;
    lines.push("");

    const stags = sc.tags || [];
    if (stags.length > 0) {
      lines.push(`  ${stags.map((t: any) => t.name).join(" ")}`);
    }

    lines.push(`  Scenario: ${sc.name || ""}`);
    if (sc.description) {
      for (const line of sc.description.split("\n")) {
        lines.push(`    ${line.trimEnd()}`);
      }
    }

    for (const step of sc.steps || []) {
      lines.push(`    ${step.keyword}${step.text}`);
    }
  }

  return lines.join("\n") + "\n";
}

// ========== Helpers ==========

function parseFeature(source: string, type: Feature["type"]): Feature {
  const doc = parse(source);
  const gherkin = doc.feature!;
  const scenarios: Scenario[] = (gherkin.children || [])
    .filter((c: any) => c.scenario)
    .map((c: any) => ({
      ...c.scenario!,
      verifiable: c.scenario!.tags.some((t: any) => t.name === "@testable"),
    }));
  return { ...gherkin, type, scenarios };
}

// ========== LocalPlatform ==========

export class LocalPlatform implements Platform {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // ===== Graph Persistence =====

  loadGraph(): SerializedGraph {
    const graphPath = join(this.rootDir, "graph.json");
    if (!existsSync(graphPath)) {
      return { nodes: [], edges: [] };
    }
    return JSON.parse(readFileSync(graphPath, "utf-8"));
  }

  saveGraph(graph: SerializedGraph): void {
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(
      join(this.rootDir, "graph.json"),
      JSON.stringify(graph, null, 2),
      "utf-8",
    );

    // Clean up content files for shadowed nodes
    for (const node of graph.nodes) {
      if (node.attributes.shadow) {
        this.removeContent(node.key);
      }
    }
  }

  // ===== Content Storage =====

  writeContent(key: string, content: Feature): void {
    const filePath = this.contentPath(key);
    mkdirSync(dirname(filePath), { recursive: true });

    // Infer type from node key or feature type
    writeFileSync(filePath, featureToGherkin(content), "utf-8");
  }

  readContent(key: string): Feature | null {
    const filePath = this.contentPath(key);
    if (!existsSync(filePath)) return null;

    // Infer type from filename — last segment before .feature
    const source = readFileSync(filePath, "utf-8");
    try {
      return parseFeature(source, undefined as any);
    } catch {
      return null;
    }
  }

  removeContent(key: string): void {
    const filePath = this.contentPath(key);
    if (existsSync(filePath)) rmSync(filePath);
  }

  // ===== Settings =====

  readSettings(): Record<string, unknown> {
    const settingsPath = join(this.rootDir, "settings.json");
    if (!existsSync(settingsPath)) return {};
    return JSON.parse(readFileSync(settingsPath, "utf-8"));
  }

  writeSettings(settings: Record<string, unknown>): void {
    const existing = this.readSettings();
    const merged = { ...existing, ...settings };
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(
      join(this.rootDir, "settings.json"),
      JSON.stringify(merged, null, 2),
      "utf-8",
    );
  }

  // ===== Internal =====

  /** Map a node key to its content file path. */
  private contentPath(key: string): string {
    return join(this.rootDir, "content", `${key}.feature`);
  }
}
