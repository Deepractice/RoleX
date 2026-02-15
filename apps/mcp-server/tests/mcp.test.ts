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
    const result = rolex.born("Feature: Sean", "sean");
    state.register("sean", result.state);
    expect(state.resolve("sean")).toBe(result.state);
  });

  it("resolve throws on unknown id", () => {
    expect(() => state.resolve("unknown")).toThrow("Not found");
  });

  it("unregister removes entry", () => {
    const result = rolex.born("Feature: Sean", "sean");
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
//  State: encounter / experience registries (named, selective)
// ================================================================

describe("cognition registries", () => {
  it("register and resolve encounters by id", () => {
    const r1 = rolex.born("Feature: A");
    const r2 = rolex.born("Feature: B");
    state.registerEncounter("task-a", r1.state);
    state.registerEncounter("task-b", r2.state);
    const resolved = state.resolveEncounters(["task-a", "task-b"]);
    expect(resolved).toHaveLength(2);
    expect(resolved[0]).toBe(r1.state);
    expect(resolved[1]).toBe(r2.state);
  });

  it("listEncounters returns all ids", () => {
    const r1 = rolex.born("Feature: A");
    const r2 = rolex.born("Feature: B");
    state.registerEncounter("task-a", r1.state);
    state.registerEncounter("task-b", r2.state);
    expect(state.listEncounters()).toEqual(["task-a", "task-b"]);
  });

  it("consumeEncounters removes selected entries", () => {
    const r1 = rolex.born("Feature: A");
    const r2 = rolex.born("Feature: B");
    state.registerEncounter("task-a", r1.state);
    state.registerEncounter("task-b", r2.state);
    state.consumeEncounters(["task-a"]);
    expect(state.listEncounters()).toEqual(["task-b"]);
  });

  it("resolveEncounters throws on unknown id", () => {
    expect(() => state.resolveEncounters(["unknown"])).toThrow("Encounter not found");
  });

  it("register and resolve experiences by id", () => {
    const r1 = rolex.born("Feature: A");
    state.registerExperience("exp-a", r1.state);
    const resolved = state.resolveExperiences(["exp-a"]);
    expect(resolved).toHaveLength(1);
  });

  it("consumeExperiences removes selected entries", () => {
    const r1 = rolex.born("Feature: A");
    const r2 = rolex.born("Feature: B");
    state.registerExperience("exp-a", r1.state);
    state.registerExperience("exp-b", r2.state);
    state.consumeExperiences(["exp-a"]);
    expect(state.listExperiences()).toEqual(["exp-b"]);
  });

  it("resolveExperiences throws on unknown id", () => {
    expect(() => state.resolveExperiences(["unknown"])).toThrow("Experience not found");
  });
});

// ================================================================
//  State: cacheFromActivation
// ================================================================

describe("cacheFromActivation", () => {
  it("caches knowledge ref", () => {
    const born = rolex.born("Feature: Sean", "sean");
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
    const result = rolex.born("Feature: Sean", "sean");
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
    const sean = rolex.born("Feature: Sean", "sean");
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
    const sean = rolex.born("Feature: Sean", "sean");
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
    const goal = rolex.want(state.requireRole(), "Feature: Build Auth\n  Scenario: JWT login", "build-auth");
    state.register("build-auth", goal.state);
    state.focusedGoal = goal.state;

    // 3. Plan
    const plan = rolex.plan(state.requireGoal(), "Feature: Auth Plan\n  Scenario: Phase 1");
    state.focusedPlan = plan.state;

    // 4. Todo
    const task = rolex.todo(
      state.requirePlan(),
      "Feature: Implement JWT\n  Scenario: Token generation",
      "impl-jwt"
    );
    state.register("impl-jwt", task.state);

    // 5. Finish → encounter (registered by id)
    const taskRef = state.resolve("impl-jwt");
    const finished = rolex.finish(taskRef, state.requireRole(), "Feature: Implemented JWT token generation\n  Scenario: Discovered refresh token pattern\n    Given JWT tokens expire\n    When I implemented token generation\n    Then I discovered refresh tokens are key");
    state.registerEncounter("impl-jwt", finished.state);
    state.unregister("impl-jwt");
    expect(finished.state.name).toBe("encounter");

    // 6. Reflect → experience (selective: choose which encounters)
    const encIds = state.listEncounters();
    expect(encIds).toEqual(["impl-jwt"]);
    const encounters = state.resolveEncounters(["impl-jwt"]);
    const reflected = rolex.reflect(encounters[0], state.requireRole(), "Feature: Token rotation pattern\n  Scenario: Refresh tokens prevent session loss\n    Given tokens expire periodically\n    When refresh tokens are used\n    Then sessions persist without re-authentication");
    state.consumeEncounters(["impl-jwt"]);
    state.registerExperience("impl-jwt", reflected.state);
    expect(reflected.state.name).toBe("experience");

    // 7. Realize → principle (selective: choose which experiences)
    const expIds = state.listExperiences();
    expect(expIds).toEqual(["impl-jwt"]);
    const experiences = state.resolveExperiences(["impl-jwt"]);
    const knowledge = state.requireKnowledge();
    const realized = rolex.realize(experiences[0], knowledge, "Feature: Always use refresh tokens\n  Scenario: Short-lived tokens need rotation\n    Given access tokens have limited lifetime\n    When a system relies on long sessions\n    Then refresh tokens must be implemented");
    state.consumeExperiences(["impl-jwt"]);
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
  it("switches focused goal by id", () => {
    const born = rolex.born("Feature: Sean", "sean");
    state.activeRole = born.state;

    const goal1 = rolex.want(state.requireRole(), "Feature: Goal A", "goal-a");
    state.register("goal-a", goal1.state);
    state.focusedGoal = goal1.state;

    const goal2 = rolex.want(state.requireRole(), "Feature: Goal B", "goal-b");
    state.register("goal-b", goal2.state);
    state.focusedGoal = goal2.state;

    // Switch back to goal A
    state.focusedGoal = state.resolve("goal-a");
    expect(state.requireGoal()).toBe(goal1.state);
  });
});

// ================================================================
//  Selective cognition: multiple encounters
// ================================================================

describe("selective cognition", () => {
  it("can selectively reflect on chosen encounters", () => {
    const born = rolex.born("Feature: Sean", "sean");
    state.activeRole = born.state;
    state.cacheFromActivation(rolex.activate(born.state).state);

    // Create multiple encounters
    const goal = rolex.want(state.requireRole(), "Feature: Auth", "auth");
    state.focusedGoal = goal.state;
    const plan = rolex.plan(goal.state);
    state.focusedPlan = plan.state;

    const t1 = rolex.todo(plan.state, "Feature: Login", "login");
    state.register("login", t1.state);
    const t2 = rolex.todo(plan.state, "Feature: Signup", "signup");
    state.register("signup", t2.state);

    const enc1 = rolex.finish(t1.state, state.requireRole(), "Feature: Login implementation complete\n  Scenario: Built login flow\n    Given login was required\n    When I implemented the login form\n    Then users can authenticate");
    state.registerEncounter("login", enc1.state);
    const enc2 = rolex.finish(t2.state, state.requireRole(), "Feature: Signup implementation complete\n  Scenario: Built signup flow\n    Given signup was required\n    When I implemented the registration form\n    Then users can create accounts");
    state.registerEncounter("signup", enc2.state);

    // List encounters — should have both
    expect(state.listEncounters()).toEqual(["login", "signup"]);

    // Reflect only on "login"
    const encounters = state.resolveEncounters(["login"]);
    const reflected = rolex.reflect(encounters[0], state.requireRole(), "Feature: Login flow design insight\n  Scenario: Authentication requires multi-step validation\n    Given a login form submits credentials\n    When validation occurs server-side\n    Then error feedback must be immediate and specific");
    state.consumeEncounters(["login"]);
    state.registerExperience("login", reflected.state);

    // "signup" encounter still available
    expect(state.listEncounters()).toEqual(["signup"]);
    // "login" experience available
    expect(state.listExperiences()).toEqual(["login"]);
  });
});
