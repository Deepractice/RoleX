/**
 * api/namespace-tool.ts — Fold multiple ApiOperations into a single namespace tool.
 *
 * "Tools are channels, skills are manuals."
 *
 * Instead of exposing N individual tools, consumers can fold
 * operations into namespace-level tools (society, organization, role, skill).
 * Each tool has an `operation` discriminator + union of all params.
 */

import { z } from "zod";
import type { ApiContext, ApiNamespace, ApiOperation } from "./types.js";

/**
 * A namespace-level tool — folds multiple ApiOperations into one entry point.
 *
 * Consumers (MCP server, CLI) register these instead of individual operations.
 */
export interface NamespaceTool {
  readonly name: string;
  readonly description: string;
  readonly parameters: z.ZodType;
  execute(ctx: ApiContext, args: Record<string, any>): string;
}

/**
 * Build a folded namespace tool from a set of operations.
 *
 * The resulting tool has:
 * - `operation` (required enum) — dispatches to the right ApiOperation
 * - All operation params merged as optional — each operation validates its own required params
 *
 * Permission checking happens at the operation level, not the tool level.
 *
 * @param ns - Namespace name (becomes the tool name)
 * @param ops - Operations record in this namespace
 * @param description - Tool description (hand-crafted for quality)
 */
export function buildNamespaceTool(
  ns: ApiNamespace,
  ops: Record<string, ApiOperation>,
  description: string
): NamespaceTool {
  const opEntries = Object.values(ops);
  const opNames = opEntries.map((op) => op.name) as [string, ...string[]];

  // Merge all param shapes — everything becomes optional in the folded schema.
  // Each operation's own schema handles required validation during dispatch.
  const mergedShape: Record<string, z.ZodTypeAny> = {};
  for (const op of opEntries) {
    const shape = (op.parameters as z.ZodObject<any>).shape;
    for (const [key, zodSchema] of Object.entries(shape)) {
      if (!mergedShape[key]) {
        const s = zodSchema as z.ZodTypeAny;
        mergedShape[key] = s.isOptional() ? s : s.optional();
      }
    }
  }

  const parameters = z.object({
    operation: z.enum(opNames).describe("Operation to execute"),
    ...mergedShape,
  });

  // Lookup by operation name
  const opByName = new Map(opEntries.map((op) => [op.name, op]));

  return {
    name: ns,
    description,
    parameters,
    execute(ctx: ApiContext, args: Record<string, any>): string {
      const { operation, ...params } = args;
      const op = opByName.get(operation);
      if (!op) {
        throw new Error(
          `Unknown ${ns} operation: ${operation}. Available: ${opNames.join(", ")}`
        );
      }

      // Operation-level permission check
      if (op.permission === "nuwa") {
        if (!ctx.currentRole || ctx.currentRoleName !== "nuwa") {
          const who = ctx.currentRoleName || "none";
          return `Permission denied. Only nuwa can use "${op.name}". Current role: ${who}`;
        }
      }
      if (op.permission === "role" && !ctx.currentRole) {
        throw new Error("No active role. Call identity(roleId) first to activate a role.");
      }

      // Validate against operation's own schema (catches missing required params)
      const validated = op.parameters.parse(params);
      return op.execute(ctx, validated);
    },
  };
}
