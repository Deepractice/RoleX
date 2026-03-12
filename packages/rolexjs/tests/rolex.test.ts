import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CommandResult } from "@rolexjs/core";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX } from "../src/index.js";
import { describe as renderDescribe, hint as renderHint, renderState } from "../src/render.js";

function setup() {
  return createRoleX({ platform: localPlatform({ dataDir: null }) });
}

// ================================================================
//  use() dispatch
// ================================================================

describe("use dispatch", () => {
  test("!society.born creates individual", async () => {
    const rolex = setup();
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "society.born",
      params: { content: "Feature: Sean", id: "sean" },
      id: null,
    });
    const r = response.result!;
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("sean");
    expect(r.process).toBe("born");
    const names = r.state.children!.map((c) => c.name);
    expect(names).toContain("identity");
  });

  test("chained operations via use", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    await rolex.rpc({
      jsonrpc: "2.0",
      method: "role.want",
      params: { individual: "sean", goal: "Feature: Auth", id: "g1" },
      id: null,
    });
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "role.plan",
      params: { goal: "g1", plan: "Feature: JWT", id: "p1" },
      id: null,
    });
    const r = response.result!;
    expect(r.state.name).toBe("plan");
  });

  test("survey returns rendered world state", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    await rolex.society.found({ id: "dp" });
    const result = await rolex.survey();
    expect(result).toContain("sean");
    expect(result).toContain("dp");
  });

  test("throws on unknown command", async () => {
    const rolex = setup();
    const response = await rolex.rpc({
      jsonrpc: "2.0",
      method: "foo.bar",
      params: {},
      id: null,
    });
    expect(response.error).toBeDefined();
  });

  test("throws on unknown method", async () => {
    const rolex = setup();
    const response = await rolex.rpc({
      jsonrpc: "2.0",
      method: "org.nope",
      params: {},
      id: null,
    });
    expect(response.error).toBeDefined();
  });
});

// ================================================================
//  activate() + Role API
// ================================================================

describe("activate", () => {
  test("returns Role with id and project renders state", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    expect(role.id).toBe("sean");
    const output = await role.project();
    expect(output).toContain("[individual]");
  });

  test("throws on non-existent individual", async () => {
    const rolex = setup();
    expect(rolex.individual.activate({ individual: "nobody" })).rejects.toThrow(
      '"nobody" not found'
    );
  });

  test("Role.want/plan/todo/finish work through Role API", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    const wantR = await role.want("Feature: Auth", "auth");
    expect(wantR).toContain('Goal "auth" declared.');
    expect(wantR).toContain("[goal]");

    const planR = await role.plan("Feature: JWT", "jwt");
    expect(planR).toContain("[plan]");

    const todoR = await role.todo("Feature: Login", "login");
    expect(todoR).toContain("[task]");

    const finishR = await role.finish(
      "login",
      "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok"
    );
    expect(finishR).toContain("[encounter]");
  });

  test("focus rejects non-goal ids", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await expect(role.focus("jwt")).rejects.toThrow(
      '"jwt" is a plan, not a goal. focus only accepts goal ids.'
    );
  });

  test("Role.use delegates to Rolex.direct", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    const r = await role.use<string>("!society.found", { content: "Feature: DP", id: "dp" });
    expect(r).toContain("dp");
  });
});

// ================================================================
//  Render
// ================================================================

describe("render", () => {
  test("describe generates text with name", async () => {
    const rolex = setup();
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "society.born",
      params: { id: "sean" },
      id: null,
    });
    const r = response.result!;
    const text = renderDescribe("born", "sean", r.state);
    expect(text).toContain("sean");
  });

  test("hint generates next step", () => {
    const h = renderHint("born");
    expect(h).toStartWith("Next:");
  });

  test("renderState renders individual with heading", async () => {
    const rolex = setup();
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "society.born",
      params: { content: "Feature: I am Sean\n  An AI role.", id: "sean" },
      id: null,
    });
    const r = response.result!;
    const md = renderState(r.state);
    expect(md).toContain("# [individual]");
    expect(md).toContain("Feature: I am Sean");
  });

  test("renderState renders nested structure", async () => {
    const rolex = setup();
    await rolex.society.born({ id: "sean" });
    await rolex.rpc({
      jsonrpc: "2.0",
      method: "role.want",
      params: { individual: "sean", goal: "Feature: Build auth", id: "g1" },
      id: null,
    });
    await rolex.rpc({
      jsonrpc: "2.0",
      method: "role.plan",
      params: { goal: "g1", plan: "Feature: JWT plan", id: "p1" },
      id: null,
    });
    await rolex.rpc({
      jsonrpc: "2.0",
      method: "role.todo",
      params: { plan: "p1", task: "Feature: Login endpoint", id: "t1" },
      id: null,
    });
    // Get goal state via focus (returns projected state)
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "role.focus",
      params: { goal: "g1" },
      id: null,
    });
    const r = response.result!;
    const md = renderState(r.state);
    expect(md).toContain("# [goal]");
    expect(md).toContain("## [plan]");
    expect(md).toContain("### [task]");
  });

  test("renderState filters empty child nodes", () => {
    const state = {
      name: "organization",
      id: "acme",
      description: "An org",
      information: "Feature: ACME\n  A company.",
      children: [
        { name: "charter", description: "The rules and mission", children: [] },
        { name: "charter", description: "The rules and mission", children: [] },
        {
          name: "charter",
          id: "acme-charter",
          description: "The rules and mission",
          information: "Feature: ACME Charter\n  Build things.",
          children: [],
        },
      ],
    } as any;
    const md = renderState(state);
    expect(md).not.toContain("[charter]\n");
    expect(md).toContain("[charter] (acme-charter)");
    expect(md).toContain("Feature: ACME Charter");
  });
});

// ================================================================
//  Gherkin validation (through use dispatch)
// ================================================================

describe("gherkin validation", () => {
  test("rejects non-Gherkin input", async () => {
    const rolex = setup();
    const response = await rolex.rpc({
      jsonrpc: "2.0",
      method: "society.born",
      params: { content: "not gherkin", id: "test-bad" },
      id: null,
    });
    expect(response.error).toBeDefined();
    expect(response.error!.message).toContain("Invalid Gherkin");
  });

  test("accepts valid Gherkin", async () => {
    const rolex = setup();
    const result = await rolex.society.born({ content: "Feature: Sean", id: "test-good" });
    expect(result).toBeDefined();
  });
});

// ================================================================
//  Persistent mode
// ================================================================

describe("persistent mode", () => {
  const testDir = join(tmpdir(), "rolex-persist-test");

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
  });

  function persistentSetup() {
    return createRoleX({ platform: localPlatform({ dataDir: testDir, resourceDir: null }) });
  }

  test("born → retire round-trip", async () => {
    const rolex = persistentSetup();
    await rolex.society.born({ content: "Feature: Test", id: "test-ind" });
    const response = await rolex.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "society.retire",
      params: { individual: "test-ind" },
      id: null,
    });
    const r = response.result!;
    expect(r.state.name).toBe("individual");
    expect(r.process).toBe("retire");
  });

  test("archived entity survives cross-instance reload", async () => {
    const rolex1 = persistentSetup();
    await rolex1.society.born({ content: "Feature: Test", id: "test-ind" });
    await rolex1.society.retire({ individual: "test-ind" });

    const rolex2 = persistentSetup();
    // rehire should find the archived entity
    const response = await rolex2.rpc<CommandResult>({
      jsonrpc: "2.0",
      method: "society.rehire",
      params: { individual: "test-ind" },
      id: null,
    });
    const r = response.result!;
    expect(r.state.name).toBe("individual");
  });
});
