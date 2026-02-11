/**
 * RoleXGraph — thin wrapper over graphology.
 *
 * Graph stores topology only (key, type, shadow, state).
 * Content (Feature data) is NOT in the graph — loaded on demand via Platform.
 *
 * Three primitive categories:
 * - Node: addNode, getNode, updateNode, hasNode, findNodes, dropNode
 * - Edge: relate (undirected), relateTo (directed), unrelate, edges, neighbors
 * - Shadow: shadow (with cascade), restore
 */

import Graph from "graphology";
import type { GraphModel, SerializedGraph } from "@rolexjs/system";

export type { SerializedGraph };

export interface NodeAttributes {
  /** Semantic type: "persona" | "goal" | "plan" | "task" | ... */
  type: string;
  /** Whether this node is in the shadow world. */
  shadow: boolean;
  /** Mutable runtime state (e.g. focus). */
  state: Record<string, unknown>;
}

export interface EdgeAttributes {
  /** Semantic type: "has-role" | "has-goal" | "has-plan" | "member" | ... */
  type: string;
}

export class RoleXGraph implements GraphModel {
  private graph: Graph<NodeAttributes, EdgeAttributes>;

  constructor() {
    this.graph = new Graph<NodeAttributes, EdgeAttributes>({
      multi: false,
      type: "mixed",
      allowSelfLoops: false,
    });
  }

  // ===== Node =====

  addNode(key: string, type: string): void {
    this.graph.addNode(key, { type, shadow: false, state: {} });
  }

  getNode(key: string): NodeAttributes | undefined {
    if (!this.graph.hasNode(key)) return undefined;
    return this.graph.getNodeAttributes(key);
  }

  updateNode(key: string, attrs: Partial<NodeAttributes>): void {
    this.graph.mergeNodeAttributes(key, attrs);
  }

  hasNode(key: string): boolean {
    return this.graph.hasNode(key);
  }

  dropNode(key: string): void {
    this.graph.dropNode(key);
  }

  findNodes(
    filter: (key: string, attrs: NodeAttributes) => boolean,
  ): string[] {
    return this.graph.filterNodes(
      (key, attrs) => filter(key, attrs),
    );
  }

  // ===== Edge =====

  /** Add undirected (bidirectional) edge. */
  relate(a: string, b: string, type: string): void {
    this.graph.addUndirectedEdge(a, b, { type });
  }

  /** Add directed edge. */
  relateTo(from: string, to: string, type: string): void {
    this.graph.addDirectedEdge(from, to, { type });
  }

  /** Remove edge between two nodes. */
  unrelate(a: string, b: string): void {
    const edge = this.graph.edge(a, b);
    if (edge) this.graph.dropEdge(edge);
  }

  /** Check if two nodes are connected. */
  hasEdge(a: string, b: string): boolean {
    return this.graph.hasEdge(a, b);
  }

  /** Get all neighbors, optionally filtered by edge type. */
  neighbors(key: string, edgeType?: string): string[] {
    if (!edgeType) {
      return this.graph.neighbors(key);
    }
    const result: string[] = [];
    this.graph.forEachEdge(key, (_edge, attrs, source, target) => {
      if (attrs.type === edgeType) {
        const neighbor = source === key ? target : source;
        if (!result.includes(neighbor)) result.push(neighbor);
      }
    });
    return result;
  }

  /** Get directed outbound neighbors, optionally filtered by edge type. */
  outNeighbors(key: string, edgeType?: string): string[] {
    if (!edgeType) {
      return this.graph.outNeighbors(key);
    }
    const result: string[] = [];
    this.graph.forEachOutEdge(key, (_edge, attrs, _source, target) => {
      if (attrs.type === edgeType) {
        if (!result.includes(target)) result.push(target);
      }
    });
    return result;
  }

  /** Get directed inbound neighbors, optionally filtered by edge type. */
  inNeighbors(key: string, edgeType?: string): string[] {
    if (!edgeType) {
      return this.graph.inNeighbors(key);
    }
    const result: string[] = [];
    this.graph.forEachInEdge(key, (_edge, attrs, source, _target) => {
      if (attrs.type === edgeType) {
        if (!result.includes(source)) result.push(source);
      }
    });
    return result;
  }

  // ===== Shadow =====

  /** Move node to shadow world. If cascade=true, recursively shadow connected nodes. */
  shadow(key: string, cascade: boolean = true): void {
    if (!this.graph.hasNode(key)) return;
    if (this.graph.getNodeAttribute(key, "shadow")) return;

    this.graph.setNodeAttribute(key, "shadow", true);

    if (cascade) {
      // Cascade along outbound directed edges
      this.graph.forEachOutEdge(key, (_edge, _attrs, _source, target) => {
        this.shadow(target, true);
      });
    }
  }

  /** Restore node from shadow world. */
  restore(key: string): void {
    if (!this.graph.hasNode(key)) return;
    this.graph.setNodeAttribute(key, "shadow", false);
  }

  // ===== Serialization =====

  export(): SerializedGraph {
    const nodes: SerializedGraph["nodes"] = [];
    this.graph.forEachNode((key, attrs) => {
      nodes.push({ key, attributes: { ...attrs } });
    });

    const edges: SerializedGraph["edges"] = [];
    this.graph.forEachEdge(
      (_edge, attrs, source, target, _sourceAttrs, _targetAttrs, undirected) => {
        edges.push({
          source,
          target,
          attributes: { ...attrs },
          undirected,
        });
      },
    );

    return { nodes, edges };
  }

  import(data: SerializedGraph): void {
    this.graph.clear();
    for (const node of data.nodes) {
      this.graph.addNode(node.key, node.attributes);
    }
    for (const edge of data.edges) {
      if (edge.undirected) {
        this.graph.addUndirectedEdge(edge.source, edge.target, edge.attributes);
      } else {
        this.graph.addDirectedEdge(edge.source, edge.target, edge.attributes);
      }
    }
  }

  /** Number of nodes (excluding shadowed if specified). */
  order(excludeShadow: boolean = false): number {
    if (!excludeShadow) return this.graph.order;
    return this.findNodes((_key, attrs) => !attrs.shadow).length;
  }

  /** Number of edges. */
  size(): number {
    return this.graph.size;
  }
}
