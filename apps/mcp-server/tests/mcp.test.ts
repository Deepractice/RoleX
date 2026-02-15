/**
 * MCP server integration tests.
 *
 * Tests the stateful MCP layer (state + render) on top of stateless Rolex.
 * Does not test FastMCP transport — only the logic behind each tool.
 */
import { describe, it, expect, beforeEach } from "bun:test";
import { createRoleX, Rolex } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";
import { McpState } from "../src/state.js";
import { render } from "../src/render.js";

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
  it("finds an individual by id (case insensitive)", () => {
    rolex.born("Feature: Sean\n  A backend architect", "sean");
    const found = state.findIndividual("sean");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("individual");
  });

  it("returns null when not found", () => {
    expect(state.findIndividual("nobody")).toBeNull();
  });

  it("finds by alias", () => {
    rolex.born("Feature: I am Sean the Architect", "sean", ["Sean", "姜山"]);
    const found = state.findIndividual("姜山");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("individual");
  });

  it("finds by alias case insensitive", () => {
    rolex.born("Feature: Sean", "sean", ["Sean"]);
    const found = state.findIndividual("SEAN");
    expect(found).not.toBeNull();
  });
});

// ================================================================
//  State: registry
// ================================================================

describe("registry", () => {
  it("register and resolve", () => {
    const result = rolex.born("Feature: Sean");
    state.register("sean", result.state);
    expect(state.resolve("sean")).toBe(result.state);
  });

  it("resolve throws on unknown name", () => {
    expect(() => state.resolve("unknown")).toThrow("Not found");
  });

  it("unregister removes entry", () => {
    const result = rolex.born("Feature: Sean");
    state.register("sean", result.state);
    state.unregister("sean");
    expect(() => state.resolve("sean")).toThrow("Not found");
  });
});

// ================================================================
//  State: requirements
// ================================================================

describe("requirements", () => {
  it("requireRole throws without active role", () => {
    expect(() => state.requireRole()).toThrow("No active role");
  });

  it("requireGoal throws without focused goal", () => {
    expect(() => state.requireGoal()).toThrow("No focused goal");
  });

  it("requirePlan throws without focused plan", () => {
    expect(() => state.requirePlan()).toThrow("No focused plan");
  });

  it("requireKnowledge throws without knowledge ref", () => {
    expect(() => state.requireKnowledge()).toThrow("No knowledge branch");
  });
});

// ================================================================
//  State: encounter / experience stacks
// ================================================================

describe("cognition stacks", () => {
  it("push and pop encounter (LIFO)", () => {
    const r1 = rolex.born("Feature: A");
    const r2 = rolex.born("Feature: B");
    state.pushEncounter(r1.state);
    state.pushEncounter(r2.state);
    expect(state.popEncounter()).toBe(r2.state);
    expect(state.popEncounter()).toBe(r1.state);
  });

  it("popEncounter throws when empty", () => {
    expect(() => state.popEncounter()).toThrow("No encounters");
  });

  it("push and pop experience (LIFO)", () => {
    const r1 = rolex.born("Feature: A");
    state.pushExperience(r1.state);
    expect(state.popExperience()).toBe(r1.state);
  });

  it("popExperience throws when empty", () => {
    expect(() => state.popExperience()).toThrow("No experiences");
  });
});

// ================================================================
//  State: cacheFromActivation
// ================================================================

describe("cacheFromActivation", () => {
  it("caches knowledge ref", () => {
    const born = rolex.born("Feature: Sean");
    const activated = rolex.activate(born.state);
    state.cacheFromActivation(activated.state);
    expect(state.knowledgeRef).not.toBeNull();
    expect(state.knowledgeRef!.name).toBe("knowledge");
  });
});

// ================================================================
//  Render: 3-layer output
// ================================================================

describe("render", () => {
  it("includes status + hint + projection", () => {
    const result = rolex.born("Feature: Sean");
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

  it("includes bidirectional links in projection", () => {
    // Born + found + hire → individual has "belong" link
    const sean = rolex.born("Feature: Sean");
    const org = rolex.found("Feature: Deepractice");
    rolex.hire(org.state, sean.state);

    const activated = rolex.activate(sean.state);
    const output = render({
      process: "activate",
      name: "Sean",
      result: activated,
    });
    // Individual should have belong → organization via bidirectional link
    expect(output).toContain("belong");
    expect(output).toContain("Deepractice");
  });

  it("includes appointment relation in projection", () => {
    const sean = rolex.born("Feature: Sean");
    const org = rolex.found("Feature: Deepractice");
    const pos = rolex.establish(org.state, "Feature: Architect");
    rolex.hire(org.state, sean.state);
    rolex.appoint(pos.state, sean.state);

    const activated = rolex.activate(sean.state);
    const output = render({
      process: "activate",
      name: "Sean",
      result: activated,
    });
    // Individual should have serve → position via bidirectional link
    expect(output).toContain("serve");
    expect(output).toContain("Architect");
  });
});

// ================================================================
//  Full flow: identity → want → plan → todo → finish → reflect
// ================================================================

describe("full execution flow", () => {
  it("completes identity → want → plan → todo → finish → reflect → realize", () => {
    // Setup: born externally with id
    const born = rolex.born("Feature: Sean", "sean");

    // 1. Identity (activate)
    const individual = state.findIndividual("sean");
    expect(individual).not.toBeNull();
    state.activeRole = individual!;
    const activated = rolex.activate(individual!);
    state.cacheFromActivation(activated.state);

    // 2. Want
    const goal = rolex.want(state.requireRole(), "Feature: Build Auth\n  Scenario: JWT login");
    state.register("build-auth", goal.state);
    state.focusedGoal = goal.state;

    // 3. Plan
    const plan = rolex.plan(state.requireGoal(), "Feature: Auth Plan\n  Scenario: Phase 1");
    state.focusedPlan = plan.state;

    // 4. Todo
    const task = rolex.todo(
      state.requirePlan(),
      "Feature: Implement JWT\n  Scenario: Token generation"
    );
    state.register("impl-jwt", task.state);

    // 5. Finish → encounter
    const taskRef = state.resolve("impl-jwt");
    const finished = rolex.finish(taskRef, state.requireRole(), "JWT refresh is key");
    state.pushEncounter(finished.state);
    state.unregister("impl-jwt");
    expect(finished.state.name).toBe("encounter");

    // 6. Reflect → experience
    const encounter = state.popEncounter();
    const reflected = rolex.reflect(encounter, state.requireRole(), "Token rotation pattern");
    state.pushExperience(reflected.state);
    expect(reflected.state.name).toBe("experience");

    // 7. Realize → principle
    const exp = state.popExperience();
    const knowledge = state.requireKnowledge();
    const realized = rolex.realize(exp, knowledge, "Always use refresh tokens");
    expect(realized.state.name).toBe("principle");

    // Verify the knowledge has the principle
    const knowledgeState = rolex.project(knowledge);
    const children = (knowledgeState as any).children ?? [];
    expect(children.some((c: any) => c.name === "principle")).toBe(true);
  });
});

// ================================================================
//  Focus: switch goals
// ================================================================

describe("focus", () => {
  it("switches focused goal by name", () => {
    const born = rolex.born("Feature: Sean");
    state.activeRole = born.state;

    const goal1 = rolex.want(state.requireRole(), "Feature: Goal A");
    state.register("goal-a", goal1.state);
    state.focusedGoal = goal1.state;

    const goal2 = rolex.want(state.requireRole(), "Feature: Goal B");
    state.register("goal-b", goal2.state);
    state.focusedGoal = goal2.state;

    // Switch back to goal A
    state.focusedGoal = state.resolve("goal-a");
    expect(state.requireGoal()).toBe(goal1.state);
  });
});
