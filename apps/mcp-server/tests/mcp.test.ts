/**
 * MCP server integration tests.
 *
 * Tests the thin MCP layer (state holder) on top of RoleX.
 * Business logic (Role model) is tested in core/tests/unit/role-model.test.ts.
 * Render is now in rolexjs — Role methods return rendered strings directly.
 */
import { beforeEach, describe, expect, it } from "bun:test";
import type { CommandResult } from "@rolexjs/core";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX, type RoleXBuilder } from "rolexjs";
import { render } from "../../../packages/rolexjs/src/render.js";
import { McpState } from "../src/state.js";

let rolex: RoleXBuilder;
let state: McpState;

beforeEach(() => {
  rolex = createRoleX({ platform: localPlatform({ dataDir: null }) });
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
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    state.role = role;
    expect(state.requireRole()).toBe(role);
    expect(state.requireRole().id).toBe("sean");
  });
});

// ================================================================
//  Render: 3-layer output (now in rolexjs)
// ================================================================

describe("render", () => {
  it("includes status + hint + projection", async () => {
    const result = await rolex.society.born<CommandResult>({
      content: "Feature: Sean",
      id: "sean",
      raw: true,
    });
    const output = render({
      process: "born",
      name: "Sean",
      state: result.state,
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
    const result = await rolex.society.born<CommandResult>({
      content: "Feature: Sean",
      id: "sean",
      raw: true,
    });
    const output = render({
      process: "born",
      name: "Sean",
      state: result.state,
      cognitiveHint: "I have no goal yet. Declare one with want.",
    });
    expect(output).toContain("I →");
    expect(output).toContain("I have no goal yet");
  });

  it("Role methods return rendered 3-layer output", async () => {
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });

    const output = await role.want("Feature: Test", "test-goal");
    // Layer 1: Status
    expect(output).toContain('Goal "test-goal" declared.');
    // Layer 2: Hint
    expect(output).toContain("Next:");
    // Layer 3: Projection
    expect(output).toContain("[goal]");
  });
});

// ================================================================
//  Full flow: MCP thin layer integration
// ================================================================

describe("full execution flow", () => {
  it("completes want → plan → todo → finish → reflect → realize through Role API", async () => {
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    state.role = role;

    // Want
    const goal = await role.want("Feature: Build Auth", "build-auth");
    expect(role.snapshot().focusedGoalId).toBe("build-auth");
    expect(goal).toContain("I →");

    // Plan
    const plan = await role.plan("Feature: Auth Plan", "auth-plan");
    expect(role.snapshot().focusedPlanId).toBe("auth-plan");
    expect(plan).toContain("I →");

    // Todo
    const task = await role.todo("Feature: Implement JWT", "impl-jwt");
    expect(task).toContain("I →");

    // Finish with encounter
    const finished = await role.finish(
      "impl-jwt",
      "Feature: Implemented JWT\n  Scenario: Token pattern\n    Given JWT needed\n    Then tokens work"
    );
    expect(finished).toContain("[encounter]");
    expect(role.snapshot().encounterIds).toContain("impl-jwt-finished");

    // Reflect: encounter → experience
    const reflected = await role.reflect(
      ["impl-jwt-finished"],
      "Feature: Token rotation insight\n  Scenario: Refresh matters\n    Given tokens expire\n    Then refresh tokens are key",
      "token-insight"
    );
    expect(reflected).toContain("[experience]");
    expect(role.snapshot().encounterIds).not.toContain("impl-jwt-finished");
    expect(role.snapshot().experienceIds).toContain("token-insight");

    // Realize: experience → principle
    const realized = await role.realize(
      ["token-insight"],
      "Feature: Always use refresh tokens\n  Scenario: Short-lived tokens need rotation\n    Given access tokens expire\n    Then refresh tokens must exist",
      "refresh-tokens"
    );
    expect(realized).toContain("[principle]");
    expect(role.snapshot().experienceIds).not.toContain("token-insight");
  });
});

// ================================================================
//  Focus: switch goals
// ================================================================

describe("focus", () => {
  it("switches focused goal via Role", async () => {
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    state.role = role;

    await role.want("Feature: Goal A", "goal-a");
    expect(role.snapshot().focusedGoalId).toBe("goal-a");

    await role.want("Feature: Goal B", "goal-b");
    expect(role.snapshot().focusedGoalId).toBe("goal-b");

    // Switch back to goal A
    await role.focus("goal-a");
    expect(role.snapshot().focusedGoalId).toBe("goal-a");
  });
});

// ================================================================
//  Selective cognition: multiple encounters
// ================================================================

describe("selective cognition", () => {
  it("tracks multiple encounters, reflect consumes selectively", async () => {
    await rolex.society.born({ content: "Feature: Sean", id: "sean" });
    const role = await rolex.individual.activate({ individual: "sean" });
    state.role = role;

    await role.want("Feature: Auth", "auth");
    await role.plan("Feature: Plan", "plan1");
    await role.todo("Feature: Login", "login");
    await role.todo("Feature: Signup", "signup");

    await role.finish(
      "login",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    );
    await role.finish(
      "signup",
      "Feature: Signup done\n  Scenario: OK\n    Given signup\n    Then success"
    );

    expect(role.snapshot().encounterIds).toContain("login-finished");
    expect(role.snapshot().encounterIds).toContain("signup-finished");

    // Reflect only on "login-finished"
    await role.reflect(
      ["login-finished"],
      "Feature: Login insight\n  Scenario: OK\n    Given practice\n    Then understanding",
      "login-insight"
    );

    // "login-finished" consumed, "signup-finished" still available
    const snap = role.snapshot();
    expect(snap.encounterIds).not.toContain("login-finished");
    expect(snap.encounterIds).toContain("signup-finished");
    expect(snap.experienceIds).toContain("login-insight");
  });
});
