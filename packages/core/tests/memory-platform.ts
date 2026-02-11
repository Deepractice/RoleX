/**
 * MemoryPlatform — in-memory Platform<Feature> for testing.
 *
 * Graph persistence: stores serialized graph in memory.
 * Content storage: stores Feature objects in a Map keyed by node key.
 */

import type { Feature, Platform, SerializedGraph } from "@rolexjs/core";

export class MemoryPlatform implements Platform {
  private graph: SerializedGraph = { nodes: [], edges: [] };
  private content = new Map<string, Feature>();
  private settings: Record<string, unknown> = {};

  // ===== Graph Persistence =====

  loadGraph(): SerializedGraph {
    return this.graph;
  }

  saveGraph(graph: SerializedGraph): void {
    this.graph = graph;
  }

  // ===== Content Storage =====

  writeContent(key: string, content: Feature): void {
    this.content.set(key, content);
  }

  readContent(key: string): Feature | null {
    return this.content.get(key) ?? null;
  }

  removeContent(key: string): void {
    this.content.delete(key);
  }

  // ===== Settings =====

  readSettings(): Record<string, unknown> {
    return this.settings;
  }

  writeSettings(settings: Record<string, unknown>): void {
    this.settings = { ...this.settings, ...settings };
  }
}
