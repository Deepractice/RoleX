/**
 * LocalPlatform — filesystem implementation of Platform<Feature>.
 *
 * Generic mapping from Platform concepts to filesystem:
 *
 *   Structure  → .rolex/{parent}/{name}/
 *   Information → .rolex/{parent}/{structure}/{info-name}.{info-type}.feature
 *   Relation   → .rolex/{parent}/{structure}/.rel/{rel-name}.{target}
 *
 * The `parent` parameter in createStructure determines the structure-type
 * grouping directory. This is tracked in .rolex/index.json for lookup.
 *
 * Example:
 *   createStructure("sean", "roles")
 *     → .rolex/roles/sean/
 *   writeInformation("sean", "goal", "ship-v2", feature)
 *     → .rolex/roles/sean/ship-v2.goal.feature
 *   addRelation("focus", "sean", "ship-v2")
 *     → .rolex/roles/sean/.rel/focus.ship-v2
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@rolexjs/parser";
import type { Feature, Scenario, Platform } from "@rolexjs/core";

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

// ========== Index ==========

interface Index {
  /** Maps structure name → parent (structure-type directory). */
  structures: Record<string, string | undefined>;
}

// ========== LocalPlatform ==========

export class LocalPlatform implements Platform {
  private readonly rootDir: string;
  private index: Index | null = null;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // ===== Structure =====

  createStructure(name: string, parent?: string): void {
    const dir = this.structurePath(name, parent);
    mkdirSync(dir, { recursive: true });

    const idx = this.loadIndex();
    idx.structures[name] = parent;
    this.saveIndex(idx);
  }

  removeStructure(name: string): void {
    const dir = this.resolveStructurePath(name);
    if (existsSync(dir)) rmSync(dir, { recursive: true });

    const idx = this.loadIndex();
    delete idx.structures[name];
    this.saveIndex(idx);
  }

  listStructures(parent?: string): string[] {
    const idx = this.loadIndex();
    return Object.entries(idx.structures)
      .filter(([_, p]) => p === parent)
      .map(([name]) => name)
      .sort();
  }

  hasStructure(name: string, parent?: string): boolean {
    const idx = this.loadIndex();
    if (!(name in idx.structures)) return false;
    if (parent !== undefined) return idx.structures[name] === parent;
    return true;
  }

  // ===== Information =====

  writeInformation(structure: string, type: string, name: string, content: Feature): Feature {
    const dir = this.resolveStructurePath(structure);
    mkdirSync(dir, { recursive: true });

    const filePath = join(dir, `${name}.${type}.feature`);
    writeFileSync(filePath, featureToGherkin(content), "utf-8");
    return content;
  }

  readInformation(structure: string, type: string, name: string): Feature | null {
    const dir = this.resolveStructurePath(structure);
    const filePath = join(dir, `${name}.${type}.feature`);
    if (!existsSync(filePath)) return null;

    return parseFeature(readFileSync(filePath, "utf-8"), type as Feature["type"]);
  }

  listInformation(structure: string, type: string): Feature[] {
    const dir = this.resolveStructurePath(structure);
    if (!existsSync(dir)) return [];

    const suffix = `.${type}.feature`;
    return readdirSync(dir)
      .filter((f) => f.endsWith(suffix))
      .sort()
      .map((f) => parseFeature(readFileSync(join(dir, f), "utf-8"), type as Feature["type"]));
  }

  removeInformation(structure: string, type: string, name: string): void {
    const dir = this.resolveStructurePath(structure);
    const filePath = join(dir, `${name}.${type}.feature`);
    if (existsSync(filePath)) rmSync(filePath);
  }

  // ===== Relation =====

  addRelation(name: string, from: string, to: string): void {
    const dir = join(this.resolveStructurePath(from), ".rel");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.${to}`), "", "utf-8");
  }

  listRelations(name: string, from: string): string[] {
    const dir = join(this.resolveStructurePath(from), ".rel");
    if (!existsSync(dir)) return [];

    const prefix = `${name}.`;
    return readdirSync(dir)
      .filter((f) => f.startsWith(prefix))
      .map((f) => f.slice(prefix.length))
      .sort();
  }

  hasRelation(name: string, from: string, to: string): boolean {
    return existsSync(join(this.resolveStructurePath(from), ".rel", `${name}.${to}`));
  }

  removeRelation(name: string, from: string, to: string): void {
    const filePath = join(this.resolveStructurePath(from), ".rel", `${name}.${to}`);
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
    writeFileSync(join(this.rootDir, "settings.json"), JSON.stringify(merged, null, 2), "utf-8");
  }

  // ===== Internal =====

  /** Build path for a structure given its name and parent. */
  private structurePath(name: string, parent?: string): string {
    if (parent) return join(this.rootDir, parent, name);
    return join(this.rootDir, name);
  }

  /** Resolve a structure name to its filesystem path via index lookup. */
  private resolveStructurePath(name: string): string {
    const idx = this.loadIndex();
    const parent = idx.structures[name];
    return this.structurePath(name, parent);
  }

  private loadIndex(): Index {
    if (this.index) return this.index;

    const indexPath = join(this.rootDir, "index.json");
    if (existsSync(indexPath)) {
      const raw = JSON.parse(readFileSync(indexPath, "utf-8"));
      this.index = { structures: raw.structures ?? {} };
      return this.index;
    }

    mkdirSync(this.rootDir, { recursive: true });
    const idx: Index = { structures: {} };
    this.saveIndex(idx);
    return idx;
  }

  private saveIndex(idx: Index): void {
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(join(this.rootDir, "index.json"), JSON.stringify(idx, null, 2), "utf-8");
    this.index = idx;
  }
}
