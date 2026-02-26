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

describe("Role (ctx management)", () => {
  test("activate returns Role with ctx", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    expect(role.ctx).toBeInstanceOf(RoleContext);
    expect(role.ctx.roleId).toBe("sean");
  });

  test("want updates ctx.focusedGoalId", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    const result = role.want("Feature: Build auth", "build-auth");
    expect(role.ctx.focusedGoalId).toBe("build-auth");
    expect(role.ctx.focusedPlanId).toBeNull();
    expect(result.hint).toBeDefined();
  });

  test("plan updates ctx.focusedPlanId", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    role.want("Feature: Auth", "auth-goal");
    const result = role.plan("Feature: JWT strategy", "jwt-plan");
    expect(role.ctx.focusedPlanId).toBe("jwt-plan");
    expect(result.hint).toBeDefined();
  });

  test("finish with encounter registers in ctx", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    role.want("Feature: Auth", "auth");
    role.plan("Feature: JWT", "jwt");
    role.todo("Feature: Login", "login");

    const result = role.finish(
      "login",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success",
    );
    expect(role.ctx.encounterIds.has("login-finished")).toBe(true);
    expect(result.hint).toBeDefined();
  });

  test("finish without encounter does not register in ctx", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    role.want("Feature: Auth", "auth");
    role.plan("Feature: JWT", "jwt");
    role.todo("Feature: Login", "login");

    role.finish("login");
    expect(role.ctx.encounterIds.size).toBe(0);
  });

  test("complete registers encounter and clears focusedPlanId", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    role.want("Feature: Auth", "auth");
    role.plan("Feature: JWT", "jwt");

    const result = role.complete(
      "jwt",
      "Feature: JWT done\n  Scenario: OK\n    Given jwt\n    Then done",
    );
    expect(role.ctx.focusedPlanId).toBeNull();
    expect(role.ctx.encounterIds.has("jwt-completed")).toBe(true);
    expect(result.hint).toContain("auth");
  });

  test("reflect consumes encounter and adds experience in ctx", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");

    role.want("Feature: Auth", "auth");
    role.plan("Feature: JWT", "jwt");
    role.todo("Feature: Login", "login");
    role.finish(
      "login",
      "Feature: Login done\n  Scenario: OK\n    Given x\n    Then y",
    );

    expect(role.ctx.encounterIds.has("login-finished")).toBe(true);

    role.reflect(
      "login-finished",
      "Feature: Token insight\n  Scenario: OK\n    Given x\n    Then y",
      "token-insight",
    );

    expect(role.ctx.encounterIds.has("login-finished")).toBe(false);
    expect(role.ctx.experienceIds.has("token-insight")).toBe(true);
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

describe("Role context persistence", () => {
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
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });

    // Session 1: set focus
    const role1 = await rolex.activate("sean");
    role1.want("Feature: Auth", "auth");
    role1.plan("Feature: JWT", "jwt");
    expect(role1.ctx.focusedGoalId).toBe("auth");
    expect(role1.ctx.focusedPlanId).toBe("jwt");

    // Verify context.json written
    const contextPath = join(dataDir, "context", "sean.json");
    expect(existsSync(contextPath)).toBe(true);
    const data = JSON.parse(readFileSync(contextPath, "utf-8"));
    expect(data.focusedGoalId).toBe("auth");
    expect(data.focusedPlanId).toBe("jwt");

    // Session 2: re-activate restores
    const role2 = await rolex.activate("sean");
    expect(role2.ctx.focusedGoalId).toBe("auth");
    expect(role2.ctx.focusedPlanId).toBe("jwt");
  });

  test("activate without persisted context uses rehydrate default", async () => {
    const { rolex } = persistent();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    await rolex.direct("!role.want", { individual: "sean", goal: "Feature: Auth", id: "auth" });

    const role = await rolex.activate("sean");
    expect(role.ctx.focusedGoalId).toBe("auth");
    expect(role.ctx.focusedPlanId).toBeNull();
  });

  test("focus saves updated context", async () => {
    const { rolex, dataDir } = persistent();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });

    const role = await rolex.activate("sean");
    role.want("Feature: Goal A", "goal-a");
    role.want("Feature: Goal B", "goal-b");

    role.focus("goal-a");

    const data = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    expect(data.focusedGoalId).toBe("goal-a");
    expect(data.focusedPlanId).toBeNull();
  });

  test("complete clears focusedPlanId and saves", async () => {
    const { rolex, dataDir } = persistent();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });

    const role = await rolex.activate("sean");
    role.want("Feature: Auth", "auth");
    role.plan("Feature: JWT", "jwt");
    role.complete(
      "jwt",
      "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok",
    );

    const data = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    expect(data.focusedGoalId).toBe("auth");
    expect(data.focusedPlanId).toBeNull();
  });

  test("different roles have independent contexts", async () => {
    const { rolex, dataDir } = persistent();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    await rolex.direct("!individual.born", { content: "Feature: Nuwa", id: "nuwa" });

    const seanRole = await rolex.activate("sean");
    seanRole.want("Feature: Sean Goal", "sean-goal");

    const nuwaRole = await rolex.activate("nuwa");
    nuwaRole.want("Feature: Nuwa Goal", "nuwa-goal");

    const seanData = JSON.parse(readFileSync(join(dataDir, "context", "sean.json"), "utf-8"));
    const nuwaData = JSON.parse(readFileSync(join(dataDir, "context", "nuwa.json"), "utf-8"));
    expect(seanData.focusedGoalId).toBe("sean-goal");
    expect(nuwaData.focusedGoalId).toBe("nuwa-goal");

    // Re-activate sean — should get sean's context
    const seanRole2 = await rolex.activate("sean");
    expect(seanRole2.ctx.focusedGoalId).toBe("sean-goal");
  });

  test("in-memory mode (dataDir: null) works without persistence", async () => {
    const rolex = setup();
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    role.want("Feature: Auth", "auth");
    expect(role.ctx.focusedGoalId).toBe("auth");
  });
});
