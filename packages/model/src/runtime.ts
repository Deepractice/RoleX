/**
 * Runtime — defineSystem() and executable process types.
 *
 * Turns declarative model definitions into runnable systems.
 * Platform is generic — each domain (core, etc.) provides its own.
 */

import { z } from "zod";
import type { ProcessDefinition } from "./process.js";
import type { Platform, SerializedGraph } from "./platform.js";

/** Graph interface required by ProcessContext. */
export interface GraphModel {
  addNode(key: string, type: string): void;
  getNode(key: string): { type: string; shadow: boolean; state: Record<string, unknown> } | undefined;
  updateNode(key: string, attrs: Partial<{ type: string; shadow: boolean; state: Record<string, unknown> }>): void;
  hasNode(key: string): boolean;
  dropNode(key: string): void;
  findNodes(filter: (key: string, attrs: { type: string; shadow: boolean; state: Record<string, unknown> }) => boolean): string[];
  relate(a: string, b: string, type: string): void;
  relateTo(from: string, to: string, type: string): void;
  unrelate(a: string, b: string): void;
  hasEdge(a: string, b: string): boolean;
  neighbors(key: string, edgeType?: string): string[];
  outNeighbors(key: string, edgeType?: string): string[];
  inNeighbors(key: string, edgeType?: string): string[];
  shadow(key: string, cascade?: boolean): void;
  restore(key: string): void;
  export(): SerializedGraph;
  import(data: SerializedGraph): void;
}

/** Provides built-in base identity for roles. */
export interface BaseProvider<I = unknown> {
  /** List all built-in role names. */
  listRoles(): string[];
  /** Get all identity features for a role (common + role-specific). */
  listIdentity(roleName: string): I[];
  /** Read a specific base information item (e.g., procedure for skill). */
  readInformation(roleName: string, type: string, name: string): I | null;
}

/** Runtime context passed to every process. */
export interface ProcessContext<I = unknown> {
  /** Graph model — topology in memory. */
  readonly graph: GraphModel;
  /** Platform — content persistence (on demand). */
  readonly platform: Platform<I>;
  /** Current active structure name (e.g. role name). */
  structure: string;
  /** Current locale. Reads from platform settings, defaults to "en". */
  readonly locale: string;
  /** Optional base identity provider for built-in role templates. */
  readonly base?: BaseProvider<I>;
}

/** A process with params schema and execute logic. */
export interface Process<TParams = any, I = unknown> extends ProcessDefinition {
  readonly params: z.ZodType<TParams>;
  execute(ctx: ProcessContext<I>, params: TParams): string | Promise<string>;
}

/** Configuration for defineSystem(). */
export interface SystemConfig<I = unknown> {
  readonly name: string;
  readonly description?: string;
  readonly processes: Record<string, Process<any, I>>;
}

/** A runnable system instance. */
export interface RunnableSystem<I = unknown> {
  readonly name: string;
  readonly description: string;
  readonly processes: Record<string, Process<any, I>>;
  readonly ctx: ProcessContext<I>;

  /** Execute a named process with validated params. */
  execute(processName: string, params: unknown): Promise<string>;

  /** List all process names. */
  list(): string[];
}

/** Create a runnable system from config + platform + graph. */
export function defineSystem<I>(
  graph: GraphModel,
  platform: Platform<I>,
  config: SystemConfig<I>,
  base?: BaseProvider<I>
): RunnableSystem<I> {
  const ctx: ProcessContext<I> = {
    graph,
    platform,
    structure: "",
    get locale(): string {
      return (platform.readSettings?.()?.locale as string) ?? "en";
    },
    base,
  };

  return {
    name: config.name,
    description: config.description ?? "",
    processes: config.processes,
    ctx,

    async execute(processName: string, params: unknown): Promise<string> {
      const process = config.processes[processName];
      if (!process) {
        throw new Error(`Unknown process: ${processName}`);
      }

      const parsed = process.params.parse(params);
      const result = await process.execute(ctx, parsed);

      // Auto-persist graph topology after every mutation
      platform.saveGraph(graph.export());

      return result;
    },

    list(): string[] {
      return Object.keys(config.processes);
    },
  };
}
