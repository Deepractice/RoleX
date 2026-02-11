/**
 * createRolex — the entry point.
 *
 * Wires Graph + Platform + built-in ResourceX into all four systems.
 * MCP server only needs `individual`.
 */

import {
  RoleXGraph,
  createRoleSystem,
  createIndividualSystem,
  createOrgSystem,
  createGovernanceSystem,
} from "@rolexjs/core";
import type { Platform, GraphModel } from "@rolexjs/core";
import type { RunnableSystem } from "@rolexjs/system";
import type { Feature } from "@rolexjs/core";
import { createResourceX, setProvider } from "resourcexjs";
import { NodeProvider } from "@resourcexjs/node-provider";
import { join } from "node:path";
import { homedir } from "node:os";
import { base } from "./base/index.js";

export interface RolexConfig {
  /** Storage platform (graph persistence + content storage). */
  platform: Platform;
  /** Optional ResourceX registry URL. Defaults to https://registry.deepractice.dev */
  registry?: string;
}

export interface Rolex {
  /** The graph model (shared topology). */
  readonly graph: GraphModel;
  /** First-person cognitive lifecycle (14 processes). MCP exposes this. */
  readonly individual: RunnableSystem<Feature>;
  /** External role lifecycle: born, teach, train, retire, kill. */
  readonly role: RunnableSystem<Feature>;
  /** External org lifecycle: found, dissolve. */
  readonly org: RunnableSystem<Feature>;
  /** Internal org governance: rule, establish, hire, appoint, etc. */
  readonly governance: RunnableSystem<Feature>;
}

/** Create all four systems from a single config. */
export function createRolex(config: RolexConfig): Rolex {
  const { platform, registry } = config;

  // Create graph and load persisted topology
  const graph = new RoleXGraph();
  const saved = platform.loadGraph();
  if (saved.nodes.length > 0) {
    graph.import(saved);
  }

  // Built-in ResourceX — skill and use processes both need it.
  setProvider(new NodeProvider());
  const rx = createResourceX({
    path: join(homedir(), ".deepractice", "resourcex"),
    registry: registry || "https://registry.deepractice.dev",
  });

  return {
    graph,
    individual: createIndividualSystem(graph, platform, rx, base),
    role: createRoleSystem(graph, platform),
    org: createOrgSystem(graph, platform),
    governance: createGovernanceSystem(graph, platform),
  };
}
