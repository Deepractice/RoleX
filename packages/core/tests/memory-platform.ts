/**
 * MemoryPlatform — in-memory Platform<Feature> for testing.
 *
 * Pure storage. No parsing — Process handles that.
 */

import type { Feature, Platform } from "@rolexjs/core";

interface StructureEntry {
  name: string;
  parent?: string;
}

export class MemoryPlatform implements Platform {
  private structures = new Map<string, StructureEntry>();
  private information = new Map<string, Feature>();
  private relations = new Map<string, Set<string>>();

  // ===== Structure =====

  createStructure(name: string, parent?: string): void {
    this.structures.set(name, { name, parent });
  }

  removeStructure(name: string): void {
    this.structures.delete(name);
    // Remove all information belonging to this structure
    for (const key of [...this.information.keys()]) {
      if (key.startsWith(`${name}:`)) this.information.delete(key);
    }
    // Remove all relations involving this structure
    for (const [key, targets] of [...this.relations.entries()]) {
      if (key.endsWith(`:${name}`)) {
        this.relations.delete(key);
      } else {
        targets.delete(name);
      }
    }
  }

  listStructures(parent?: string): string[] {
    const result: string[] = [];
    for (const [name, entry] of this.structures) {
      if (entry.parent === parent) result.push(name);
    }
    return result;
  }

  hasStructure(name: string, parent?: string): boolean {
    const entry = this.structures.get(name);
    if (!entry) return false;
    if (parent !== undefined) return entry.parent === parent;
    return true;
  }

  // ===== Information =====

  writeInformation(structure: string, type: string, name: string, content: Feature): Feature {
    this.information.set(`${structure}:${type}:${name}`, content);
    return content;
  }

  readInformation(structure: string, type: string, name: string): Feature | null {
    return this.information.get(`${structure}:${type}:${name}`) ?? null;
  }

  listInformation(structure: string, type: string): Feature[] {
    const prefix = `${structure}:${type}:`;
    const result: Feature[] = [];
    for (const [key, value] of this.information) {
      if (key.startsWith(prefix)) result.push(value);
    }
    return result;
  }

  removeInformation(structure: string, type: string, name: string): void {
    this.information.delete(`${structure}:${type}:${name}`);
  }

  // ===== Relation (many-to-many) =====

  addRelation(name: string, from: string, to: string): void {
    const key = `${name}:${from}`;
    if (!this.relations.has(key)) this.relations.set(key, new Set());
    this.relations.get(key)!.add(to);
  }

  listRelations(name: string, from: string): string[] {
    return [...(this.relations.get(`${name}:${from}`) ?? [])];
  }

  hasRelation(name: string, from: string, to: string): boolean {
    return this.relations.get(`${name}:${from}`)?.has(to) ?? false;
  }

  removeRelation(name: string, from: string, to: string): void {
    this.relations.get(`${name}:${from}`)?.delete(to);
  }
}
