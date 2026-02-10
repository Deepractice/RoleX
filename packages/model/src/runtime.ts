/**
 * Runtime — defineSystem() and executable process types.
 *
 * Turns declarative model definitions into runnable systems.
 * Platform is generic — each domain (core, etc.) provides its own.
 */

import { z } from "zod";
import type { ProcessDefinition } from "./process.js";
import type { Platform } from "./platform.js";

/** Provides built-in base identity for roles. */
export interface BaseProvider<I = unknown> {
  /** Get all identity features for a role (common + role-specific). */
  listIdentity(roleName: string): I[];
  /** Read a specific base information item (e.g., procedure for skill). */
  readInformation(roleName: string, type: string, name: string): I | null;
}

/** Runtime context passed to every process. */
export interface ProcessContext<I = unknown> {
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

/** Create a runnable system from config + platform. */
export function defineSystem<I>(platform: Platform<I>, config: SystemConfig<I>, base?: BaseProvider<I>): RunnableSystem<I> {
  const ctx: ProcessContext<I> = {
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
      return process.execute(ctx, parsed);
    },

    list(): string[] {
      return Object.keys(config.processes);
    },
  };
}
