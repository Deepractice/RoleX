import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "@rolexjs/local-platform";
import type { CommandResult } from "@rolexjs/prototype";
import { createRoleX } from "../src/index.js";
import { describe as renderDescribe, hint as renderHint, renderState } from "../src/render.js";

async function setup() {
  return await createRoleX(localPlatform({ dataDir: null }));
}

// ================================================================
//  use() dispatch
// ================================================================

describe("use dispatch", () => {
  test("!individual.born creates individual", async () => {
    const rolex = await setup();
    const r = await rolex.direct<CommandResult>(
      "!individual.born",
      {
        content: "Feature: Sean",
        id: "sean",
      },
      { raw: true }
    );
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("sean");
    expect(r.process).toBe("born");
    const names = r.state.children!.map((c) => c.name);
    expect(names).toContain("identity");
  });

  test("chained operations via use", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    await rolex.direct("!role.want", { individual: "sean", goal: "Feature: Auth", id: "g1" });
    const r = await rolex.direct<CommandResult>(
      "!role.plan",
      {
        goal: "g1",
        plan: "Feature: JWT",
        id: "p1",
      },
      { raw: true }
    );
    expect(r.state.name).toBe("plan");
  });

  test("!census.list returns text", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    await rolex.direct("!org.found", { id: "dp" });
    const result = await rolex.direct<string>("!census.list");
    expect(result).toContain("sean");
    expect(result).toContain("dp");
  });

  test("throws on unknown command", async () => {
    const rolex = await setup();
    expect(rolex.direct("!foo.bar")).rejects.toThrow();
  });

  test("throws on unknown method", async () => {
    const rolex = await setup();
    expect(rolex.direct("!org.nope")).rejects.toThrow();
  });
});

// ================================================================
//  activate() + Role API
// ================================================================

describe("activate", () => {
  test("returns Role with ctx and project renders state", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    expect(role.roleId).toBe("sean");
    expect(role.ctx).toBeDefined();
    const output = await role.project();
    expect(output).toContain("[individual]");
  });

  test("throws on non-existent individual", async () => {
    const rolex = await setup();
    expect(rolex.activate("nobody")).rejects.toThrow('"nobody" not found');
  });

  test("Role.want/plan/todo/finish work through Role API", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    const role = await rolex.activate("sean");

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
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    const role = await rolex.activate("sean");
    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await expect(role.focus("jwt")).rejects.toThrow(
      '"jwt" is a plan, not a goal. focus only accepts goal ids.'
    );
  });

  test("Role.use delegates to Rolex.direct", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    const role = await rolex.activate("sean");
    const r = await role.use<string>("!org.found", { content: "Feature: DP", id: "dp" });
    expect(r).toContain("dp");
  });
});

// ================================================================
//  Render
// ================================================================

describe("render", () => {
  test("describe generates text with name", async () => {
    const rolex = await setup();
    const r = await rolex.direct<CommandResult>("!individual.born", { id: "sean" }, { raw: true });
    const text = renderDescribe("born", "sean", r.state);
    expect(text).toContain("sean");
  });

  test("hint generates next step", () => {
    const h = renderHint("born");
    expect(h).toStartWith("Next:");
  });

  test("renderState renders individual with heading", async () => {
    const rolex = await setup();
    const r = await rolex.direct<CommandResult>(
      "!individual.born",
      {
        content: "Feature: I am Sean\n  An AI role.",
        id: "sean",
      },
      { raw: true }
    );
    const md = renderState(r.state);
    expect(md).toContain("# [individual]");
    expect(md).toContain("Feature: I am Sean");
  });

  test("renderState renders nested structure", async () => {
    const rolex = await setup();
    await rolex.direct("!individual.born", { id: "sean" });
    await rolex.direct("!role.want", { individual: "sean", goal: "Feature: Build auth", id: "g1" });
    await rolex.direct("!role.plan", { goal: "g1", plan: "Feature: JWT plan", id: "p1" });
    await rolex.direct("!role.todo", { plan: "p1", task: "Feature: Login endpoint", id: "t1" });
    // Get goal state via focus (returns projected state)
    const r = await rolex.direct<CommandResult>("!role.focus", { goal: "g1" }, { raw: true });
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
    const rolex = await setup();
    expect(rolex.direct("!individual.born", { content: "not gherkin" })).rejects.toThrow(
      "Invalid Gherkin"
    );
  });

  test("accepts valid Gherkin", async () => {
    const rolex = await setup();
    await expect(
      rolex.direct("!individual.born", { content: "Feature: Sean" })
    ).resolves.toBeDefined();
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

  async function persistentSetup() {
    return await createRoleX(localPlatform({ dataDir: testDir, resourceDir: null }));
  }

  test("born → retire round-trip", async () => {
    const rolex = await persistentSetup();
    await rolex.direct("!individual.born", { content: "Feature: Test", id: "test-ind" });
    const r = await rolex.direct<CommandResult>(
      "!individual.retire",
      { individual: "test-ind" },
      { raw: true }
    );
    expect(r.state.name).toBe("individual");
    expect(r.process).toBe("retire");
  });

  test("archived entity survives cross-instance reload", async () => {
    const rolex1 = await persistentSetup();
    await rolex1.direct("!individual.born", { content: "Feature: Test", id: "test-ind" });
    await rolex1.direct("!individual.retire", { individual: "test-ind" });

    const rolex2 = await persistentSetup();
    // rehire should find the archived entity
    const r = await rolex2.direct<CommandResult>(
      "!individual.rehire",
      { individual: "test-ind" },
      { raw: true }
    );
    expect(r.state.name).toBe("individual");
  });
});
