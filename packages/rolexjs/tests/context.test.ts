import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX, RoleContext } from "../src/index.js";

function setup() {
  return createRoleX(localPlatform({ dataDir: null }));
}

function setupWithDir() {
  const dataDir = join(tmpdir(), `rolex-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dataDir, { recursive: true });
  const rolex = createRoleX(localPlatform({ dataDir, resourceDir: null }));
  return { rolex, dataDir };
}

describe("RoleContext", () => {
  test("activate returns ctx in result", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const result = await rolex.role.activate("sean");
    expect(result.ctx).toBeInstanceOf(RoleContext);
    expect(result.ctx!.roleId).toBe("sean");
    expect(result.hint).toBeDefined();
  });

  test("want updates ctx.focusedGoalId", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    const result = rolex.role.want("sean", "Feature: Build auth", "build-auth", undefined, ctx!);
    expect(ctx!.focusedGoalId).toBe("build-auth");
    expect(ctx!.focusedPlanId).toBeNull();
    expect(result.hint).toBeDefined();
  });

  test("plan updates ctx.focusedPlanId", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    rolex.role.want("sean", "Feature: Auth", "auth-goal", undefined, ctx!);
    const result = rolex.role.plan("auth-goal", "Feature: JWT strategy", "jwt-plan", ctx!);
    expect(ctx!.focusedPlanId).toBe("jwt-plan");
    expect(result.hint).toBeDefined();
  });

  test("finish with encounter registers in ctx", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx!);
    rolex.role.todo("jwt", "Feature: Login", "login", undefined, ctx!);

    const result = rolex.role.finish(
      "login",
      "sean",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success",
      ctx!
    );
    expect(ctx!.encounterIds.has("login-finished")).toBe(true);
    expect(result.hint).toBeDefined();
  });

  test("finish without encounter does not register in ctx", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx!);
    rolex.role.todo("jwt", "Feature: Login", "login", undefined, ctx!);

    rolex.role.finish("login", "sean", undefined, ctx!);
    expect(ctx!.encounterIds.size).toBe(0);
  });

  test("complete registers encounter and clears focusedPlanId", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx!);

    const result = rolex.role.complete(
      "jwt",
      "sean",
      "Feature: JWT done\n  Scenario: OK\n    Given jwt\n    Then done",
      ctx!
    );
    expect(ctx!.focusedPlanId).toBeNull();
    expect(ctx!.encounterIds.has("jwt-completed")).toBe(true);
    expect(result.hint).toContain("auth");
  });

  test("reflect consumes encounter and adds experience in ctx", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");

    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx!);
    rolex.role.todo("jwt", "Feature: Login", "login", undefined, ctx!);
    rolex.role.finish(
      "login",
      "sean",
      "Feature: Login done\n  Scenario: OK\n    Given x\n    Then y",
      ctx!
    );

    expect(ctx!.encounterIds.has("login-finished")).toBe(true);

    rolex.role.reflect(
      "login-finished",
      "sean",
      "Feature: Token insight\n  Scenario: OK\n    Given x\n    Then y",
      "token-insight",
      ctx!
    );

    expect(ctx!.encounterIds.has("login-finished")).toBe(false);
    expect(ctx!.experienceIds.has("token-insight")).toBe(true);
  });

  test("cognitiveHint varies by state", () => {
    const ctx = new RoleContext("sean");
    expect(ctx.cognitiveHint("activate")).toContain("no goal");

    ctx.focusedGoalId = "auth";
    expect(ctx.cognitiveHint("activate")).toContain("active goal");

    expect(ctx.cognitiveHint("want")).toContain("plan");
    expect(ctx.cognitiveHint("plan")).toContain("todo");
    expect(ctx.cognitiveHint("todo")).toContain("finish");
  });
});

describe("RoleContext persistence", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs) {
      if (existsSync(d)) rmSync(d, { recursive: true });
    }
    dirs.length = 0;
  });

  function persistent() {
    const { rolex, dataDir } = setupWithDir();
    dirs.push(dataDir);
    return { rolex, dataDir };
  }

  test("activate restores persisted focusedGoalId and focusedPlanId", async () => {
    const { rolex, dataDir } = persistent();
    rolex.individual.born("Feature: Sean", "sean");

    // Session 1: set focus
    const { ctx: ctx1 } = await rolex.role.activate("sean");
    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx1!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx1!);
    expect(ctx1!.focusedGoalId).toBe("auth");
    expect(ctx1!.focusedPlanId).toBe("jwt");

    // Verify context.json written
    const contextPath = join(dataDir, "context", "sean.json");
    expect(existsSync(contextPath)).toBe(true);
    const data = JSON.parse(readFileSync(contextPath, "utf-8"));
    expect(data.focusedGoalId).toBe("auth");
    expect(data.focusedPlanId).toBe("jwt");

    // Session 2: re-activate restores
    const { ctx: ctx2 } = await rolex.role.activate("sean");
    expect(ctx2!.focusedGoalId).toBe("auth");
    expect(ctx2!.focusedPlanId).toBe("jwt");
  });

  test("activate without persisted context uses rehydrate default", async () => {
    const { rolex } = persistent();
    rolex.individual.born("Feature: Sean", "sean");
    rolex.role.want("sean", "Feature: Auth", "auth");

    // No context.json exists — rehydrate picks first goal
    const { ctx } = await rolex.role.activate("sean");
    expect(ctx!.focusedGoalId).toBe("auth");
    expect(ctx!.focusedPlanId).toBeNull();
  });

  test("focus saves updated context", async () => {
    const { rolex, dataDir } = persistent();
    rolex.individual.born("Feature: Sean", "sean");

    const { ctx } = await rolex.role.activate("sean");
    rolex.role.want("sean", "Feature: Goal A", "goal-a", undefined, ctx!);
    rolex.role.want("sean", "Feature: Goal B", "goal-b", undefined, ctx!);

    // focus switches back to goal-a
    rolex.role.focus("goal-a", ctx!);

    const data = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    expect(data.focusedGoalId).toBe("goal-a");
    expect(data.focusedPlanId).toBeNull();
  });

  test("complete clears focusedPlanId and saves", async () => {
    const { rolex, dataDir } = persistent();
    rolex.individual.born("Feature: Sean", "sean");

    const { ctx } = await rolex.role.activate("sean");
    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    rolex.role.plan("auth", "Feature: JWT", "jwt", ctx!);
    rolex.role.complete(
      "jwt",
      "sean",
      "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok",
      ctx!
    );

    const data = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    expect(data.focusedGoalId).toBe("auth");
    expect(data.focusedPlanId).toBeNull();
  });

  test("different roles have independent contexts", async () => {
    const { rolex, dataDir } = persistent();
    rolex.individual.born("Feature: Sean", "sean");
    rolex.individual.born("Feature: Nuwa", "nuwa");

    // Sean session
    const { ctx: seanCtx } = await rolex.role.activate("sean");
    rolex.role.want("sean", "Feature: Sean Goal", "sean-goal", undefined, seanCtx!);

    // Nuwa session
    const { ctx: nuwaCtx } = await rolex.role.activate("nuwa");
    rolex.role.want("nuwa", "Feature: Nuwa Goal", "nuwa-goal", undefined, nuwaCtx!);

    // Verify independent files
    const seanData = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    const nuwaData = JSON.parse(readFileSync(join(dataDir, "context", "nuwa.json"), "utf-8"));
    expect(seanData.focusedGoalId).toBe("sean-goal");
    expect(nuwaData.focusedGoalId).toBe("nuwa-goal");

    // Re-activate sean — should get sean's context, not nuwa's
    const { ctx: seanCtx2 } = await rolex.role.activate("sean");
    expect(seanCtx2!.focusedGoalId).toBe("sean-goal");
  });

  test("in-memory mode (dataDir: null) works without persistence", async () => {
    const rolex = setup();
    rolex.individual.born("Feature: Sean", "sean");
    const { ctx } = await rolex.role.activate("sean");
    rolex.role.want("sean", "Feature: Auth", "auth", undefined, ctx!);
    // Should not throw — just no persistence
    expect(ctx!.focusedGoalId).toBe("auth");
  });
});
