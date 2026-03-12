/**
 * JSON-RPC 2.0 types and handler for RoleX.
 *
 * The RpcHandler is the single dispatch point for all RoleX operations.
 * It accepts JSON-RPC 2.0 requests and delegates to the command layer
 * via toArgs() for named-to-positional argument conversion.
 */

import type { Commands } from "./commands/types.js";
import { toArgs } from "./dispatch.js";

// ================================================================
//  JSON-RPC 2.0 message types
// ================================================================

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id?: string | number | null;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

// ================================================================
//  Standard JSON-RPC 2.0 error codes
// ================================================================

export const RPC_PARSE_ERROR = -32700;
export const RPC_INVALID_REQUEST = -32600;
export const RPC_METHOD_NOT_FOUND = -32601;
export const RPC_INVALID_PARAMS = -32602;
export const RPC_INTERNAL_ERROR = -32603;

// ================================================================
//  RpcHandler — single dispatch point
// ================================================================

export interface RpcHandlerDeps {
  commands: Commands;
  /** Custom method handlers for methods not in the commands map (e.g. activate, inspect, survey). */
  methods?: Record<string, (params: Record<string, unknown>) => Promise<unknown>>;
}

export class RpcHandler {
  private commands: Commands;
  private methods: Record<string, (params: Record<string, unknown>) => Promise<unknown>>;

  constructor(deps: RpcHandlerDeps) {
    this.commands = deps.commands;
    this.methods = deps.methods ?? {};
  }

  async handle<T = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
    const { method, params = {}, id = null } = request;

    try {
      // Route 1: Custom method handler (activate, inspect, survey)
      const custom = this.methods[method];
      if (custom) {
        const result = await custom(params);
        return ok(id, result as T);
      }

      // Route 2: Command dispatch via toArgs
      const fn = this.commands[method];
      if (!fn) {
        return error(id, RPC_METHOD_NOT_FOUND, `Unknown method "${method}".`);
      }

      const positionalArgs = toArgs(method, params);
      const result = await fn(...positionalArgs);
      return ok(id, result as T);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return error(id, RPC_INTERNAL_ERROR, message);
    }
  }
}

// ================================================================
//  Helpers
// ================================================================

function ok<T>(id: string | number | null, result: T): JsonRpcResponse<T> {
  return { jsonrpc: "2.0", id, result };
}

function error<T>(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse<T> {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}
