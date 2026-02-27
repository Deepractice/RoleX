/**
 * MCP server integration tests.
 *
 * Tests the thin MCP layer (state + render) on top of Rolex.
 * Business logic (RoleContext) is tested in rolexjs/tests/context.test.ts.
 * This file tests MCP-specific concerns: state holder, render, and integration.
 */
import { beforeEach, describe, expect, it } from "bun:test";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX, type Rolex, type RolexResult } from "rolexjs";
import { render } from "../src/render.js";
import { McpState } from "../src/state.js";

let rolex: Rolex;
let state: McpState;

beforeEach(() => {
  rolex = createRoleX(localPlatform({ dataDir: null }));
  state = new McpState();
});

// ================================================================
//  State: requireRole
// ================================================================

describe("requireRole", () => {
  it("throws without active role", () => {
    expect(() => state.requireRole()).toThrow("No active role");
  });

  it("returns role after activation", async () => {
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    state.role = role;
    expect(state.requireRole()).toBe(role);
    expect(state.requireRole().roleId).toBe("sean");
  });
});

// ================================================================
//  Render: 3-layer output
// ================================================================

describe("render", () => {
  it("includes status + hint + projection", async () => {
    const result = await rolex.direct<RolexResult>("!individual.born", {
      content: "Feature: Sean",
      id: "sean",
    });
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
  });

  it("includes cognitive hint when provided", async () => {
    const result = await rolex.direct<RolexResult>("!individual.born", {
      content: "Feature: Sean",
      id: "sean",
    });
    const output = render({
      process: "born",
      name: "Sean",
      result,
      cognitiveHint: "I have no goal yet. Declare one with want.",
    });
    expect(output).toContain("I →");
    expect(output).toContain("I have no goal yet");
  });

  it("includes bidirectional links in projection", async () => {
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    await rolex.direct("!org.found", { content: "Feature: Deepractice", id: "dp" });
    await rolex.direct("!org.hire", { org: "dp", individual: "sean" });

    // Activate and use focus to get projected state with links
    const role = await rolex.activate("sean");
    // Use want + focus to get a result with state
    role.want("Feature: Test", "test-goal");
    const result = role.focus("test-goal");

    // The role itself should have belong link — check via use
    const seanResult = await role.use<RolexResult>("!role.focus", { goal: "test-goal" });
    const output = render({
      process: "activate",
      name: "Sean",
      result: seanResult,
    });
    expect(output).toContain("[goal]");
  });
});

// ================================================================
//  Full flow: MCP thin layer integration
// ================================================================

describe("full execution flow", () => {
  it("completes want → plan → todo → finish → reflect → realize through Role API", async () => {
    // Born + activate
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    state.role = role;

    // Want
    const goal = role.want("Feature: Build Auth", "build-auth");
    expect(role.ctx.focusedGoalId).toBe("build-auth");
    expect(goal.hint).toBeDefined();

    // Plan
    const plan = role.plan("Feature: Auth Plan", "auth-plan");
    expect(role.ctx.focusedPlanId).toBe("auth-plan");
    expect(plan.hint).toBeDefined();

    // Todo
    const task = role.todo("Feature: Implement JWT", "impl-jwt");
    expect(task.hint).toBeDefined();

    // Finish with encounter
    const finished = role.finish(
      "impl-jwt",
      "Feature: Implemented JWT\n  Scenario: Token pattern\n    Given JWT needed\n    Then tokens work"
    );
    expect(finished.state.name).toBe("encounter");
    expect(role.ctx.encounterIds.has("impl-jwt-finished")).toBe(true);

    // Reflect: encounter → experience
    const reflected = role.reflect(
      "impl-jwt-finished",
      "Feature: Token rotation insight\n  Scenario: Refresh matters\n    Given tokens expire\n    Then refresh tokens are key",
      "token-insight"
    );
    expect(reflected.state.name).toBe("experience");
    expect(role.ctx.encounterIds.has("impl-jwt-finished")).toBe(false);
    expect(role.ctx.experienceIds.has("token-insight")).toBe(true);

    // Realize: experience → principle
    const realized = role.realize(
      "token-insight",
      "Feature: Always use refresh tokens\n  Scenario: Short-lived tokens need rotation\n    Given access tokens expire\n    Then refresh tokens must exist",
      "refresh-tokens"
    );
    expect(realized.state.name).toBe("principle");
    expect(role.ctx.experienceIds.has("token-insight")).toBe(false);
  });
});

// ================================================================
//  Focus: switch goals
// ================================================================

describe("focus", () => {
  it("switches focused goal via Role", async () => {
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    state.role = role;

    role.want("Feature: Goal A", "goal-a");
    expect(role.ctx.focusedGoalId).toBe("goal-a");

    role.want("Feature: Goal B", "goal-b");
    expect(role.ctx.focusedGoalId).toBe("goal-b");

    // Switch back to goal A
    role.focus("goal-a");
    expect(role.ctx.focusedGoalId).toBe("goal-a");
  });
});

// ================================================================
//  Selective cognition: multiple encounters
// ================================================================

describe("selective cognition", () => {
  it("ctx tracks multiple encounters, reflect consumes selectively", async () => {
    await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
    const role = await rolex.activate("sean");
    state.role = role;

    // Create goal + plan + tasks
    role.want("Feature: Auth", "auth");
    role.plan("Feature: Plan", "plan1");
    role.todo("Feature: Login", "login");
    role.todo("Feature: Signup", "signup");

    // Finish both with encounters
    role.finish("login", "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success");
    role.finish(
      "signup",
      "Feature: Signup done\n  Scenario: OK\n    Given signup\n    Then success"
    );

    expect(role.ctx.encounterIds.has("login-finished")).toBe(true);
    expect(role.ctx.encounterIds.has("signup-finished")).toBe(true);

    // Reflect only on "login-finished"
    role.reflect(
      "login-finished",
      "Feature: Login insight\n  Scenario: OK\n    Given practice\n    Then understanding",
      "login-insight"
    );

    // "login-finished" consumed, "signup-finished" still available
    expect(role.ctx.encounterIds.has("login-finished")).toBe(false);
    expect(role.ctx.encounterIds.has("signup-finished")).toBe(true);
    // Experience registered
    expect(role.ctx.experienceIds.has("login-insight")).toBe(true);
  });
});
