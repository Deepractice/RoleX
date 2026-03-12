import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX } from "../src/index.js";

function setup() {
  return createRoleX({ platform: localPlatform({ dataDir: null }) });
}

function setupWithDir() {
  const dataDir = join(tmpdir(), `rolex-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dataDir, { recursive: true });
  const rolex = createRoleX({ platform: localPlatform({ dataDir, resourceDir: null }) });
  return { rolex, dataDir };
}

describe("Role (state management)", () => {
  test("activate returns Role with id", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    expect(role.id).toBe("sean");
  });

  test("want updates focusedGoalId", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    const result = await role.want("Feature: Build auth", "build-auth");
    const snap = role.snapshot();
    expect(snap.focusedGoalId).toBe("build-auth");
    expect(snap.focusedPlanId).toBeNull();
    expect(result).toContain("I →");
  });

  test("plan updates focusedPlanId", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.want("Feature: Auth", "auth-goal");
    const result = await role.plan("Feature: JWT strategy", "jwt-plan");
    expect(role.snapshot().focusedPlanId).toBe("jwt-plan");
    expect(result).toContain("I →");
  });

  test("finish with encounter registers in snapshot", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await role.todo("Feature: Login", "login");

    const result = await role.finish(
      "login",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    );
    expect(role.snapshot().encounterIds).toContain("login-finished");
    expect(result).toContain("I →");
  });

  test("finish without encounter does not register", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await role.todo("Feature: Login", "login");

    await role.finish("login");
    expect(role.snapshot().encounterIds.length).toBe(0);
  });

  test("complete registers encounter and clears focusedPlanId", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");

    const result = await role.complete(
      "jwt",
      "Feature: JWT done\n  Scenario: OK\n    Given jwt\n    Then done"
    );
    const snap = role.snapshot();
    expect(snap.focusedPlanId).toBeNull();
    expect(snap.encounterIds).toContain("jwt-completed");
    expect(result).toContain("auth");
  });

  test("reflect consumes encounter and adds experience", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await role.todo("Feature: Login", "login");
    await role.finish("login", "Feature: Login done\n  Scenario: OK\n    Given x\n    Then y");

    expect(role.snapshot().encounterIds).toContain("login-finished");

    await role.reflect(
      ["login-finished"],
      "Feature: Token insight\n  Scenario: OK\n    Given x\n    Then y",
      "token-insight"
    );

    const snap = role.snapshot();
    expect(snap.encounterIds).not.toContain("login-finished");
    expect(snap.experienceIds).toContain("token-insight");
  });

  test("reflect without encounter creates experience directly", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    const result = await role.reflect(
      [],
      "Feature: Direct insight\n  Scenario: OK\n    Given learned from conversation",
      "conv-insight"
    );

    expect(result).toContain("[experience]");
    const snap = role.snapshot();
    expect(snap.experienceIds).toContain("conv-insight");
    expect(snap.encounterIds.length).toBe(0);
  });

  test("realize without experience creates principle directly", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    const result = await role.realize(
      [],
      "Feature: Direct principle\n  Scenario: OK\n    Given always blame the product",
      "product-first"
    );

    expect(result).toContain("[principle]");
    expect(role.snapshot().experienceIds.length).toBe(0);
  });

  test("realize still consumes experience when provided", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    await role.reflect(
      [],
      "Feature: Insight\n  Scenario: OK\n    Given something learned",
      "my-insight"
    );
    expect(role.snapshot().experienceIds).toContain("my-insight");

    await role.realize(
      ["my-insight"],
      "Feature: Principle\n  Scenario: OK\n    Given a general truth",
      "my-principle"
    );
    expect(role.snapshot().experienceIds).not.toContain("my-insight");
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
    const { rolex } = persistent();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });

    const role1 = await rolex.individual.activate({ individual: "sean" });
    await role1.want("Feature: Auth", "auth");
    await role1.plan("Feature: JWT", "jwt");
    expect(role1.snapshot().focusedGoalId).toBe("auth");
    expect(role1.snapshot().focusedPlanId).toBe("jwt");

    const role2 = await rolex.individual.activate({ individual: "sean" });
    expect(role2.snapshot().focusedGoalId).toBe("auth");
    expect(role2.snapshot().focusedPlanId).toBe("jwt");
  });

  test("activate without persisted context uses rehydrate default", async () => {
    const { rolex } = persistent();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    await rolex.rpc({
      jsonrpc: "2.0",
      method: "role.want",
      params: { individual: "sean", goal: "Feature: Auth", id: "auth" },
      id: null,
    });

    const role = await rolex.individual.activate({ individual: "sean" });
    expect(role.snapshot().focusedGoalId).toBe("auth");
    expect(role.snapshot().focusedPlanId).toBeNull();
  });

  test("focus saves updated context", async () => {
    const { rolex } = persistent();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });

    const role = await rolex.individual.activate({ individual: "sean" });
    await role.want("Feature: Goal A", "goal-a");
    await role.want("Feature: Goal B", "goal-b");

    await role.focus("goal-a");

    const role2 = await rolex.individual.activate({ individual: "sean" });
    expect(role2.snapshot().focusedGoalId).toBe("goal-a");
    expect(role2.snapshot().focusedPlanId).toBeNull();
  });

  test("complete clears focusedPlanId and saves", async () => {
    const { rolex } = persistent();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });

    const role = await rolex.individual.activate({ individual: "sean" });
    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: JWT", "jwt");
    await role.complete("jwt", "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok");

    const role2 = await rolex.individual.activate({ individual: "sean" });
    expect(role2.snapshot().focusedGoalId).toBe("auth");
    expect(role2.snapshot().focusedPlanId).toBeNull();
  });

  test("different roles have independent contexts", async () => {
    const { rolex } = persistent();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    await rolex.society.born({ content: "Feature: Nuwa", id: "nuwa" });

    const seanRole = await rolex.individual.activate({ individual: "sean" });
    await seanRole.want("Feature: Sean Goal", "sean-goal");

    const nuwaRole = await rolex.individual.activate({ individual: "nuwa" });
    await nuwaRole.want("Feature: Nuwa Goal", "nuwa-goal");

    const seanRole2 = await rolex.individual.activate({ individual: "sean" });
    expect(seanRole2.snapshot().focusedGoalId).toBe("sean-goal");
  });

  test("in-memory mode (dataDir: null) works without persistence", async () => {
    const rolex = setup();
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    await role.want("Feature: Auth", "auth");
    expect(role.snapshot().focusedGoalId).toBe("auth");
  });
});
