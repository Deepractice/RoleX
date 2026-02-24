import { describe, expect, test } from "bun:test";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX, RoleContext } from "../src/index.js";

function setup() {
  return createRoleX(localPlatform({ dataDir: null }));
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
