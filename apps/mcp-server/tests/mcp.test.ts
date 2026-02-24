/**
 * MCP server integration tests.
 *
 * Tests the thin MCP layer (state + render) on top of stateless Rolex.
 * Business logic (RoleContext) is tested in rolexjs/tests/context.test.ts.
 * This file tests MCP-specific concerns: state holder, render, and integration.
 */
import { beforeEach, describe, expect, it } from "bun:test";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX, type Rolex } from "rolexjs";
import { render } from "../src/render.js";
import { McpState } from "../src/state.js";

let rolex: Rolex;
let state: McpState;

beforeEach(() => {
  rolex = createRoleX(localPlatform({ dataDir: null }));
  state = new McpState(rolex);
});

// ================================================================
//  State: findIndividual
// ================================================================

describe("findIndividual", () => {
  it("returns true when individual exists", () => {
    rolex.individual.born("Feature: Sean\n  A backend architect", "sean");
    expect(state.findIndividual("sean")).toBe(true);
  });

  it("returns false when not found", () => {
    expect(state.findIndividual("nobody")).toBe(false);
  });
});

// ================================================================
//  State: requireCtx
// ================================================================

describe("requireCtx", () => {
  it("throws without active role", () => {
    expect(() => state.requireCtx()).toThrow("No active role");
  });

  it("returns ctx after activation", async () => {
    rolex.individual.born("Feature: Sean", "sean");
    const result = await rolex.role.activate("sean");
    state.ctx = result.ctx!;
    expect(state.requireCtx()).toBe(result.ctx);
    expect(state.requireCtx().roleId).toBe("sean");
  });
});

// ================================================================
//  Render: 3-layer output
// ================================================================

describe("render", () => {
  it("includes status + hint + projection", () => {
    const result = rolex.individual.born("Feature: Sean", "sean");
    const output = render({
      process: "born",
      name: "Sean",
      result,
    });
    // Layer 1: Status
    expect(output).toContain('Individual "Sean" is born.');
    // Layer 2: Hint
    expect(output).toContain("Next:");
    // Layer 3: Projection (generic markdown)
    expect(output).toContain("# [individual]");
    expect(output).toContain("## [identity]");
    expect(output).toContain("## [knowledge]");
  });

  it("includes cognitive hint when provided", () => {
    const result = rolex.individual.born("Feature: Sean", "sean");
    const output = render({
      process: "born",
      name: "Sean",
      result,
      cognitiveHint: "I have no goal yet. Declare one with want.",
    });
    expect(output).toContain("I →");
    expect(output).toContain("I have no goal yet");
  });

  it("includes bidirectional links in projection", () => {
    rolex.individual.born("Feature: Sean", "sean");
    rolex.org.found("Feature: Deepractice", "dp");
    rolex.org.hire("dp", "sean");

    // Project individual — should have belong link
    const seanState = rolex.find("sean")!;
    const output = render({
      process: "activate",
      name: "Sean",
      result: { state: seanState as any, process: "activate" },
    });
    expect(output).toContain("belong");
    expect(output).toContain("Deepractice");
  });

  it("includes appointment relation in projection", () => {
    rolex.individual.born("Feature: Sean", "sean");
    rolex.org.found("Feature: Deepractice", "dp");
    rolex.org.establish("dp", "Feature: Architect", "architect");
    rolex.org.hire("dp", "sean");
    rolex.org.appoint("architect", "sean");

    const seanState = rolex.find("sean")!;
    const output = render({
      process: "activate",
      name: "Sean",
      result: { state: seanState as any, process: "activate" },
    });
    expect(output).toContain("serve");
    expect(output).toContain("Architect");
  });
});

// ================================================================
//  Full flow: MCP thin layer integration
// ================================================================

describe("full execution flow", () => {
  it("completes want → plan → todo → finish → reflect → realize through namespace API", async () => {
    // Born + activate
    rolex.individual.born("Feature: Sean", "sean");
    const activated = await rolex.role.activate("sean");
    state.ctx = activated.ctx!;
    const ctx = state.requireCtx();

    // Want
    const goal = rolex.role.want(ctx.roleId, "Feature: Build Auth", "build-auth", undefined, ctx);
    expect(ctx.focusedGoalId).toBe("build-auth");
    expect(goal.hint).toBeDefined();

    // Plan
    const plan = rolex.role.plan("build-auth", "Feature: Auth Plan", "auth-plan", ctx);
    expect(ctx.focusedPlanId).toBe("auth-plan");
    expect(plan.hint).toBeDefined();

    // Todo
    const task = rolex.role.todo("auth-plan", "Feature: Implement JWT", "impl-jwt", undefined, ctx);
    expect(task.hint).toBeDefined();

    // Finish with encounter
    const finished = rolex.role.finish(
      "impl-jwt",
      ctx.roleId,
      "Feature: Implemented JWT\n  Scenario: Token pattern\n    Given JWT needed\n    Then tokens work",
      ctx
    );
    expect(finished.state.name).toBe("encounter");
    expect(ctx.encounterIds.has("impl-jwt-finished")).toBe(true);

    // Reflect: encounter → experience
    const reflected = rolex.role.reflect(
      "impl-jwt-finished",
      ctx.roleId,
      "Feature: Token rotation insight\n  Scenario: Refresh matters\n    Given tokens expire\n    Then refresh tokens are key",
      "token-insight",
      ctx
    );
    expect(reflected.state.name).toBe("experience");
    expect(ctx.encounterIds.has("impl-jwt-finished")).toBe(false);
    expect(ctx.experienceIds.has("token-insight")).toBe(true);

    // Realize: experience → principle
    const realized = rolex.role.realize(
      "token-insight",
      ctx.roleId,
      "Feature: Always use refresh tokens\n  Scenario: Short-lived tokens need rotation\n    Given access tokens expire\n    Then refresh tokens must exist",
      "refresh-tokens",
      ctx
    );
    expect(realized.state.name).toBe("principle");
    expect(ctx.experienceIds.has("token-insight")).toBe(false);

    // Verify principle exists under individual
    const seanState = rolex.find("sean")!;
    const principle = (seanState as any).children?.find((c: any) => c.name === "principle");
    expect(principle).toBeDefined();
    expect(principle.information).toContain("Always use refresh tokens");
  });
});

// ================================================================
//  Focus: switch goals
// ================================================================

describe("focus", () => {
  it("switches focused goal via ctx", async () => {
    rolex.individual.born("Feature: Sean", "sean");
    const activated = await rolex.role.activate("sean");
    state.ctx = activated.ctx!;
    const ctx = state.requireCtx();

    rolex.role.want(ctx.roleId, "Feature: Goal A", "goal-a", undefined, ctx);
    expect(ctx.focusedGoalId).toBe("goal-a");

    rolex.role.want(ctx.roleId, "Feature: Goal B", "goal-b", undefined, ctx);
    expect(ctx.focusedGoalId).toBe("goal-b");

    // Switch back to goal A
    rolex.role.focus("goal-a", ctx);
    expect(ctx.focusedGoalId).toBe("goal-a");
  });
});

// ================================================================
//  Selective cognition: multiple encounters
// ================================================================

describe("selective cognition", () => {
  it("ctx tracks multiple encounters, reflect consumes selectively", async () => {
    rolex.individual.born("Feature: Sean", "sean");
    const activated = await rolex.role.activate("sean");
    state.ctx = activated.ctx!;
    const ctx = state.requireCtx();

    // Create goal + plan + tasks
    rolex.role.want(ctx.roleId, "Feature: Auth", "auth", undefined, ctx);
    rolex.role.plan("auth", "Feature: Plan", "plan1", ctx);
    rolex.role.todo("plan1", "Feature: Login", "login", undefined, ctx);
    rolex.role.todo("plan1", "Feature: Signup", "signup", undefined, ctx);

    // Finish both with encounters
    rolex.role.finish(
      "login",
      ctx.roleId,
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success",
      ctx
    );
    rolex.role.finish(
      "signup",
      ctx.roleId,
      "Feature: Signup done\n  Scenario: OK\n    Given signup\n    Then success",
      ctx
    );

    expect(ctx.encounterIds.has("login-finished")).toBe(true);
    expect(ctx.encounterIds.has("signup-finished")).toBe(true);

    // Reflect only on "login-finished"
    rolex.role.reflect(
      "login-finished",
      ctx.roleId,
      "Feature: Login insight\n  Scenario: OK\n    Given practice\n    Then understanding",
      "login-insight",
      ctx
    );

    // "login-finished" consumed, "signup-finished" still available
    expect(ctx.encounterIds.has("login-finished")).toBe(false);
    expect(ctx.encounterIds.has("signup-finished")).toBe(true);
    // Experience registered
    expect(ctx.experienceIds.has("login-insight")).toBe(true);
  });
});
