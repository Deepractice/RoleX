/**
 * RoleX BDD World — test context for all systems.
 *
 * Each scenario gets a fresh platform, graph, and all four systems.
 */

import { setWorldConstructor, World } from "@deepractice/bdd";
import {
  RoleXGraph,
  createRoleSystem,
  createIndividualSystem,
  createOrgSystem,
  createGovernanceSystem,
} from "@rolexjs/core";
import type { Feature, Platform, SerializedGraph } from "@rolexjs/core";
import type { RunnableSystem } from "@rolexjs/system";

// ========== MemoryPlatform ==========

export class MemoryPlatform implements Platform {
  private graph: SerializedGraph = { nodes: [], edges: [] };
  private content = new Map<string, Feature>();
  private settings: Record<string, unknown> = {};

  loadGraph(): SerializedGraph {
    return this.graph;
  }
  saveGraph(graph: SerializedGraph): void {
    this.graph = graph;
  }
  writeContent(key: string, content: Feature): void {
    this.content.set(key, content);
  }
  readContent(key: string): Feature | null {
    return this.content.get(key) ?? null;
  }
  removeContent(key: string): void {
    this.content.delete(key);
  }
  readSettings(): Record<string, unknown> {
    return this.settings;
  }
  writeSettings(settings: Record<string, unknown>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

// ========== World ==========

export class RoleXWorld extends World {
  platform!: MemoryPlatform;
  graph!: RoleXGraph;
  roleSystem!: RunnableSystem;
  individualSystem!: RunnableSystem;
  orgSystem!: RunnableSystem;
  govSystem!: RunnableSystem;

  /** Last operation result */
  result?: string;
  /** Last operation error */
  error?: Error;

  /** Initialize fresh systems */
  init(): void {
    this.platform = new MemoryPlatform();
    this.graph = new RoleXGraph();
    this.roleSystem = createRoleSystem(this.graph, this.platform);
    this.individualSystem = createIndividualSystem(this.graph, this.platform);
    this.orgSystem = createOrgSystem(this.graph, this.platform);
    this.govSystem = createGovernanceSystem(this.graph, this.platform);
    this.result = undefined;
    this.error = undefined;
  }

  /** Execute and capture result or error */
  async run(system: RunnableSystem, process: string, args: unknown): Promise<void> {
    try {
      this.error = undefined;
      this.result = await system.execute(process, args);
    } catch (e) {
      this.error = e as Error;
      this.result = undefined;
    }
  }
}

setWorldConstructor(RoleXWorld);
