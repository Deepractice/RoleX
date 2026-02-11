/**
 * Platform — persistence layer for the graph model.
 *
 * The graph (topology: nodes + edges) lives in memory as RoleXGraph.
 * Platform handles two concerns:
 *   1. Graph persistence — load/save the topology
 *   2. Content storage — read/write node content on demand
 *
 * Graph stores topology only (key, type, shadow, state).
 * Content (e.g. Gherkin Feature) is heavy and loaded on demand.
 *
 * Of the six system concepts:
 *   Graph topology (Structure + Relation + State) → in memory (RoleXGraph)
 *   Content (Information) → on demand via Platform
 *   Process, System → runtime
 */

export interface SerializedNode {
  key: string;
  attributes: {
    type: string;
    shadow: boolean;
    state: Record<string, unknown>;
  };
}

export interface SerializedEdge {
  source: string;
  target: string;
  attributes: { type: string };
  undirected: boolean;
}

export interface SerializedGraph {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

export interface Platform<I = unknown> {
  // ===== Graph Persistence =====

  /** Load graph topology (nodes + edges, no content). */
  loadGraph(): SerializedGraph;

  /** Save graph topology. */
  saveGraph(graph: SerializedGraph): void;

  // ===== Content Storage (on demand) =====

  /** Write content for a node. */
  writeContent(key: string, content: I): void;

  /** Read content for a node. Returns null if not found. */
  readContent(key: string): I | null;

  /** Remove content for a node. */
  removeContent(key: string): void;

  // ===== Settings (global key-value, optional) =====

  readSettings?(): Record<string, unknown>;
  writeSettings?(settings: Record<string, unknown>): void;
}
