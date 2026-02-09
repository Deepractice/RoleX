/**
 * api/types.ts — Core types for the unified API layer.
 *
 * Every Rolex operation is an ApiOperation: name, description,
 * parameter schema (Zod), permission, and execute function.
 *
 * MCP servers, CLIs, and other clients consume ApiOperations
 * from the registry — they never redefine parameters or descriptions.
 */

import type { z } from "zod";
import type { Platform } from "@rolexjs/core";
import type { Rolex } from "../Rolex.js";
import type { Role } from "../Role.js";

/** API namespace — groups operations by domain. */
export type ApiNamespace = "society" | "organization" | "role" | "skill";

/** Permission level — who can execute this operation. */
export type Permission = "nuwa" | "role" | "any";

/**
 * ApiContext — shared mutable state for API operations.
 *
 * Managed by the host (MCP server, CLI, etc.).
 * Operations can read/write currentRole and currentRoleName.
 */
export interface ApiContext {
  readonly rolex: Rolex;
  readonly platform: Platform;
  currentRole: Role | null;
  currentRoleName: string;
}

/**
 * ApiOperation — a single atomic operation with full metadata.
 *
 * The unit of the Rolex API. Each operation is self-describing:
 * - name: unique identifier (used as MCP tool name, CLI command, etc.)
 * - namespace: which domain it belongs to
 * - description: human-readable text (MCP tool description, CLI help)
 * - parameters: Zod schema (single source of truth for validation)
 * - permission: who can call it
 * - execute: the actual logic, returns formatted output string
 */
export interface ApiOperation<TParams = any> {
  readonly name: string;
  readonly namespace: ApiNamespace;
  readonly description: string;
  readonly parameters: z.ZodType<TParams>;
  readonly permission: Permission;
  execute(ctx: ApiContext, params: TParams): string;
}

/**
 * ApiRegistry — all operations grouped by namespace.
 *
 * The central registry that MCP servers, CLIs, and other clients
 * use to discover and consume Rolex operations.
 */
export interface ApiRegistry {
  readonly society: Record<string, ApiOperation>;
  readonly organization: Record<string, ApiOperation>;
  readonly role: Record<string, ApiOperation>;
  readonly skill: Record<string, ApiOperation>;

  /** Flat list of all operations across all namespaces. */
  allOperations(): ApiOperation[];
}
