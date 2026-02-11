/**
 * system-mcp — auto-derive FastMCP tools from RunnableSystem process definitions.
 *
 * MCP is simpler than CLI — FastMCP accepts zod schemas directly.
 * This is a thin loop over system processes.
 */

import type { FastMCP } from "fastmcp";
import type { Process } from "@rolexjs/system";
import type { z } from "zod";

// ========== Types ==========

type RunFn = (processName: string, args: unknown, extra?: Record<string, any>) => Promise<string>;

interface SystemMcpOptions {
  /** Execute wrapper — handles output decoration (status bar, etc.). */
  run: RunFn;
  /** Per-process execute overrides. */
  overrides?: Record<
    string,
    {
      execute: (args: any, run: RunFn) => Promise<string>;
    }
  >;
}

// ========== Main API ==========

/**
 * Register all processes as MCP tools on a FastMCP server.
 *
 * Each process becomes a tool with:
 *   - name: process.name
 *   - description: process.description (Gherkin)
 *   - parameters: process.params (zod schema, passed through directly)
 *   - execute: calls run(processName, args)
 *
 * @example
 * ```ts
 * systemToMcp(server, rolex.individual.processes, {
 *   run: (name, args) => run(name, args),
 *   overrides: {
 *     todo: {
 *       execute: async (args, run) => run("todo", args, { taskName: args.name }),
 *     },
 *   },
 * });
 * ```
 */
export function systemToMcp(
  server: FastMCP,
  processes: Record<string, Process>,
  options: SystemMcpOptions
): void {
  for (const [name, proc] of Object.entries(processes)) {
    const override = options.overrides?.[name];

    server.addTool({
      name: proc.name,
      description: proc.description,
      parameters: proc.params as z.ZodObject<any>,
      execute: override
        ? async (args: any) => override.execute(args, options.run)
        : async (args: any) => options.run(name, args),
    });
  }
}
