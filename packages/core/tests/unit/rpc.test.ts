import { describe, expect, test } from "bun:test";
import type { CommandResult } from "../../src/commands/types.js";
import type { JsonRpcRequest } from "../../src/rpc.js";
import { RPC_INTERNAL_ERROR, RPC_METHOD_NOT_FOUND, RpcHandler } from "../../src/rpc.js";

// ================================================================
//  Test helpers
// ================================================================

function mockCommands() {
  return {
    "society.born": async (content?: string, id?: string) => ({
      state: { id: id ?? "test", name: "individual" },
      process: "born",
    }),
    "survey.list": async (type?: string) => ({
      state: { name: "society", children: [] },
      process: "list",
    }),
    "org.hire": async (org: string, individual: string) => ({
      state: { id: org, name: "organization" },
      process: "hire",
    }),
  } as any;
}

function req(method: string, params?: Record<string, unknown>, id?: number | null): JsonRpcRequest {
  return { jsonrpc: "2.0", method, params, id: id ?? 1 };
}

// ================================================================
//  RpcHandler
// ================================================================

describe("RpcHandler", () => {
  test("dispatches command and returns result", async () => {
    const handler = new RpcHandler({ commands: mockCommands() });
    const response = await handler.handle<CommandResult>(
      req("society.born", { content: "Feature: Sean", id: "sean" })
    );
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result?.state.id).toBe("sean");
    expect(response.result?.state.name).toBe("individual");
    expect(response.result?.process).toBe("born");
    expect(response.error).toBeUndefined();
  });

  test("returns METHOD_NOT_FOUND for unknown method", async () => {
    const handler = new RpcHandler({ commands: mockCommands() });
    const response = await handler.handle(req("foo.bar"));
    expect(response.error).toBeDefined();
    expect(response.error!.code).toBe(RPC_METHOD_NOT_FOUND);
    expect(response.error!.message).toContain("foo.bar");
    expect(response.result).toBeUndefined();
  });

  test("returns INTERNAL_ERROR when command throws", async () => {
    const commands = {
      "test.fail": async () => {
        throw new Error("boom");
      },
    } as any;
    // Add to instructions registry temporarily — toArgs will fail for unknown instruction
    // Instead, use a custom method handler
    const handler = new RpcHandler({
      commands: {},
      methods: {
        "test.fail": async () => {
          throw new Error("boom");
        },
      },
    });
    const response = await handler.handle(req("test.fail"));
    expect(response.error).toBeDefined();
    expect(response.error!.code).toBe(RPC_INTERNAL_ERROR);
    expect(response.error!.message).toBe("boom");
  });

  test("custom methods take priority over commands", async () => {
    const handler = new RpcHandler({
      commands: mockCommands(),
      methods: {
        "role.activate": async (params) => ({
          id: params.individual,
          activated: true,
        }),
      },
    });
    const response = await handler.handle(req("role.activate", { individual: "sean" }));
    expect(response.result).toEqual({ id: "sean", activated: true });
    expect(response.error).toBeUndefined();
  });

  test("preserves request id in response", async () => {
    const handler = new RpcHandler({ commands: mockCommands() });

    const r1 = await handler.handle(req("survey.list", { type: "individual" }, 42));
    expect(r1.id).toBe(42);

    const r2 = await handler.handle({
      jsonrpc: "2.0",
      method: "survey.list",
      params: {},
      id: null,
    });
    expect(r2.id).toBeNull();
  });

  test("defaults params to empty object", async () => {
    const handler = new RpcHandler({ commands: mockCommands() });
    const response = await handler.handle({ jsonrpc: "2.0", method: "survey.list", id: 1 });
    expect(response.result).toBeDefined();
    expect(response.error).toBeUndefined();
  });
});
