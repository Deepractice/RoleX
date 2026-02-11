import { describe, test, expect } from "bun:test";
import { RoleXGraph, createRoleSystem, createIndividualSystem, createOrgSystem } from "@rolexjs/core";
import { MemoryPlatform } from "./memory-platform";

describe("Role System + Individual System — full lifecycle", () => {
  const graph = new RoleXGraph();
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(graph, platform);
  const individualSystem = createIndividualSystem(graph, platform);

  // ===== Role System (external) =====

  test("born — create a role", async () => {
    const result = await roleSystem.execute("born", {
      name: "sean",
      source: "Feature: I am Sean\n  Scenario: Background\n    Given I am a backend architect",
    });
    expect(result).toContain("[sean] born");
    expect(graph.hasNode("sean")).toBe(true);
    expect(graph.getNode("sean")?.type).toBe("role");
  });

  test("teach — add knowledge", async () => {
    const result = await roleSystem.execute("teach", {
      roleId: "sean",
      name: "typescript",
      source: "Feature: TypeScript\n  Scenario: Basics\n    Given I know TypeScript well",
    });
    expect(result).toContain("[sean] taught: typescript");
    expect(graph.hasNode("sean/typescript")).toBe(true);
    expect(graph.getNode("sean/typescript")?.type).toBe("knowledge.pattern");
  });

  test("train — add procedure", async () => {
    const result = await roleSystem.execute("train", {
      roleId: "sean",
      name: "code-review",
      source: "Feature: Code Review\n  Scenario: How to review\n    Given I read the diff first",
    });
    expect(result).toContain("[sean] trained: code-review");
    expect(graph.hasNode("sean/code-review")).toBe(true);
    expect(graph.getNode("sean/code-review")?.type).toBe("knowledge.procedure");
  });

  // ===== Individual System (first-person) =====

  test("identity — load role", async () => {
    const result = await individualSystem.execute("identity", { roleId: "sean" });
    expect(result).toContain("[sean] identity loaded");
    expect(result).toContain("I am Sean");
    expect(result).toContain("TypeScript");
    expect(result).toContain("Code Review");
  });

  test("want — set a goal", async () => {
    const result = await individualSystem.execute("want", {
      name: "build-mvp",
      source: "Feature: Build MVP\n  Scenario: Ship v1\n    Given I need a working product",
    });
    expect(result).toContain("[sean] want: build-mvp");
    // Focus stored as graph state on the role node
    expect(graph.getNode("sean")?.state?.focus).toBe("sean/build-mvp");
  });

  test("focus — check current goal (no plan yet)", async () => {
    const result = await individualSystem.execute("focus", {});
    expect(result).toContain("[sean]");
    expect(result).toContain("goal: build-mvp");
    // Full goal Gherkin
    expect(result).toContain("Feature: Build MVP");
    expect(result).toContain("I need a working product");
    // No plans yet
    expect(result).toContain("Plans: none");
  });

  test("design — create plan with name", async () => {
    const result = await individualSystem.execute("design", {
      name: "mvp-plan",
      source: "Feature: MVP Plan\n  Scenario: Phase 1\n    Given setup the database",
    });
    expect(result).toContain("[sean] plan: mvp-plan (for build-mvp)");
    // Plan linked to goal via graph edge
    const planKeys = graph.outNeighbors("sean/build-mvp", "has-plan");
    expect(planKeys.map((k) => k.split("/").pop())).toContain("mvp-plan");
    // Focus plan stored on goal node state
    expect(graph.getNode("sean/build-mvp")?.state?.focusPlan).toBe("sean/mvp-plan");
  });

  test("todo — create task (auto-associates with focused plan)", async () => {
    const result = await individualSystem.execute("todo", {
      name: "setup-db",
      source: "Feature: Setup DB\n  Scenario: Create tables\n    Given I run migrations",
    });
    expect(result).toContain("[sean] todo: setup-db (plan: mvp-plan)");
    // Task linked to plan via graph edge
    const taskKeys = graph.outNeighbors("sean/mvp-plan", "has-task");
    expect(taskKeys.map((k) => k.split("/").pop())).toContain("setup-db");
  });

  test("focus — shows full goal, plan, and task content", async () => {
    const result = await individualSystem.execute("focus", {});
    // Goal content
    expect(result).toContain("Feature: Build MVP");
    expect(result).toContain("I need a working product");
    // Plan content
    expect(result).toContain("Plans (focused: mvp-plan)");
    expect(result).toContain("Feature: MVP Plan");
    expect(result).toContain("setup the database");
    // Task content
    expect(result).toContain("Tasks (plan: mvp-plan)");
    expect(result).toContain("Feature: Setup DB");
    expect(result).toContain("I run migrations");
  });

  test("finish — complete task with conclusion", async () => {
    const result = await individualSystem.execute("finish", {
      name: "setup-db",
      conclusion:
        "Feature: DB Setup Complete\n  Scenario: Result\n    Given migrations ran successfully\n    And all tables created",
    });
    expect(result).toContain("[sean] finished: setup-db");
    expect(result).toContain("conclusion: setup-db");
  });

  test("focus — finished task shows @done", async () => {
    const result = await individualSystem.execute("focus", {});
    expect(result).toContain("[setup-db] @done");
  });

  test("achieve — synthesize experience and consume conclusions", async () => {
    // Verify conclusion exists before achieve
    expect(graph.hasNode("sean/setup-db-conclusion")).toBe(true);
    expect(graph.getNode("sean/setup-db-conclusion")?.shadow).toBe(false);

    const result = await individualSystem.execute("achieve", {
      experience: {
        name: "mvp-achievement",
        source:
          "Feature: MVP Done\n  Scenario: We shipped\n    Given the MVP is live\n    And shipping fast beats perfection",
      },
    });
    expect(result).toContain("[sean] achieved: build-mvp");
    expect(result).toContain("synthesized: mvp-achievement");
    expect(result).toContain("consumed 1 conclusion");
    // Insight written
    expect(graph.hasNode("sean/mvp-achievement")).toBe(true);
    expect(graph.getNode("sean/mvp-achievement")?.type).toBe("experience.insight");
    expect(graph.getNode("sean/mvp-achievement")?.shadow).toBe(false);
    // Conclusion consumed (shadowed)
    expect(graph.getNode("sean/setup-db-conclusion")?.shadow).toBe(true);
  });

  test("reflect — distill experience into knowledge", async () => {
    const result = await individualSystem.execute("reflect", {
      experienceNames: ["mvp-achievement"],
      knowledgeName: "shipping-principles",
      knowledgeSource:
        "Feature: Shipping Principles\n  Scenario: Key lessons\n    Given test migrations early\n    And ship fast, iterate later",
    });
    expect(result).toContain("[sean] reflected");
    expect(result).toContain("shipping-principles");
    // Insight consumed (shadowed)
    expect(graph.getNode("sean/mvp-achievement")?.shadow).toBe(true);
    // Knowledge created
    expect(graph.hasNode("sean/shipping-principles")).toBe(true);
    expect(graph.getNode("sean/shipping-principles")?.type).toBe("knowledge.pattern");
    expect(graph.getNode("sean/shipping-principles")?.shadow).toBe(false);
  });

  test("skill — requires ResourceX", async () => {
    await expect(individualSystem.execute("skill", { name: "code-review:0.1.0" })).rejects.toThrow(
      "ResourceX not available"
    );
  });

  // ===== Role System (lifecycle end) =====

  test("retire — archive role", async () => {
    const result = await roleSystem.execute("retire", { name: "sean" });
    expect(result).toContain("[sean] retired");
    // Role shadowed
    expect(graph.getNode("sean")?.shadow).toBe(true);
    // Persona content tagged with @retired
    const persona = platform.readContent("sean/persona");
    expect(persona?.tags?.some((t: any) => t.name === "@retired")).toBe(true);
  });

  test("kill — destroy role", async () => {
    await roleSystem.execute("born", {
      name: "temp",
      source: "Feature: Temp\n  Scenario: Throwaway\n    Given temporary role",
    });
    expect(graph.hasNode("temp")).toBe(true);

    const result = await roleSystem.execute("kill", { name: "temp" });
    expect(result).toContain("[temp] killed");
    // Node completely removed from graph
    expect(graph.hasNode("temp")).toBe(false);
  });
});

describe("Multi-goal, multi-plan hierarchy", () => {
  const graph = new RoleXGraph();
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(graph, platform);
  const individualSystem = createIndividualSystem(graph, platform);

  test("setup role with two goals", async () => {
    await roleSystem.execute("born", {
      name: "dev",
      source: "Feature: Developer\n  Scenario: Dev\n    Given I am a developer",
    });
    await individualSystem.execute("identity", { roleId: "dev" });

    await individualSystem.execute("want", {
      name: "goal-b",
      source: "Feature: Goal B\n  Scenario: Second goal\n    Given I want to build B",
    });
    await individualSystem.execute("want", {
      name: "goal-a",
      source: "Feature: Goal A\n  Scenario: First goal\n    Given I want to build A",
    });

    // goal-a is auto-focused (latest want always focuses)
    expect(graph.getNode("dev")?.state?.focus).toBe("dev/goal-a");
  });

  test("design two plans for goal-a", async () => {
    await individualSystem.execute("design", {
      name: "plan-a1",
      source: "Feature: Plan A1\n  Scenario: Approach 1\n    Given we try approach one",
    });
    await individualSystem.execute("design", {
      name: "plan-a2",
      source: "Feature: Plan A2\n  Scenario: Approach 2\n    Given we try approach two",
    });

    // Both plans linked to goal-a
    const plans = graph.outNeighbors("dev/goal-a", "has-plan").map((k) => k.split("/").pop());
    expect(plans).toContain("plan-a1");
    expect(plans).toContain("plan-a2");

    // plan-a2 is focused (latest design)
    expect(graph.getNode("dev/goal-a")?.state?.focusPlan).toBe("dev/plan-a2");
  });

  test("todo creates tasks under focused plan (plan-a2)", async () => {
    await individualSystem.execute("todo", {
      name: "task-1",
      source: "Feature: Task 1\n  Scenario: Do thing\n    Given I do the first thing",
    });

    const tasks = graph.outNeighbors("dev/plan-a2", "has-task").map((k) => k.split("/").pop());
    expect(tasks).toContain("task-1");
    // No tasks under plan-a1
    const tasksA1 = graph.outNeighbors("dev/plan-a1", "has-task");
    expect(tasksA1).toEqual([]);
  });

  test("focus shows full hierarchy", async () => {
    const result = await individualSystem.execute("focus", {});

    // Goal content
    expect(result).toContain("Feature: Goal A");
    expect(result).toContain("I want to build A");

    // Both plans shown
    expect(result).toContain("Feature: Plan A1");
    expect(result).toContain("Feature: Plan A2");

    // Focused plan marked
    expect(result).toContain("Plans (focused: plan-a2)");
    expect(result).toContain("[plan-a2] [focused]");

    // Tasks for focused plan
    expect(result).toContain("Tasks (plan: plan-a2)");
    expect(result).toContain("Feature: Task 1");

    // Other goals listed (key names, not Feature names)
    expect(result).toContain("Other goals: goal-b");
  });

  test("switch focus to goal-b", async () => {
    const result = await individualSystem.execute("focus", { name: "goal-b" });

    expect(result).toContain("goal: goal-b");
    expect(result).toContain("Feature: Goal B");
    // No plans for goal-b
    expect(result).toContain("Plans: none");
    // Other goals (key names)
    expect(result).toContain("Other goals: goal-a");
  });

  test("todo without plan throws error", async () => {
    // goal-b has no plan
    try {
      await individualSystem.execute("todo", {
        name: "orphan-task",
        source: "Feature: Orphan\n  Scenario: Lost\n    Given no plan",
      });
      expect(true).toBe(false); // Should not reach here
    } catch (e: any) {
      expect(e.message).toContain("No plan");
    }
  });

  test("design for goal-b and create task", async () => {
    await individualSystem.execute("design", {
      name: "plan-b1",
      source: "Feature: Plan B1\n  Scenario: B approach\n    Given we try B approach",
    });
    await individualSystem.execute("todo", {
      name: "task-b1",
      source: "Feature: Task B1\n  Scenario: B work\n    Given I do B work",
    });

    const plans = graph.outNeighbors("dev/goal-b", "has-plan").map((k) => k.split("/").pop());
    expect(plans).toContain("plan-b1");
    const tasks = graph.outNeighbors("dev/plan-b1", "has-task").map((k) => k.split("/").pop());
    expect(tasks).toContain("task-b1");
  });

  test("switch back to goal-a retains focus-plan", async () => {
    const result = await individualSystem.execute("focus", { name: "goal-a" });

    // goal-a's focused plan is still plan-a2
    expect(result).toContain("Plans (focused: plan-a2)");
    expect(result).toContain("Feature: Task 1");
  });
});

describe("Explore — discover the RoleX world", () => {
  const graph = new RoleXGraph();
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(graph, platform);
  const orgSystem = createOrgSystem(graph, platform);
  const individualSystem = createIndividualSystem(graph, platform);

  test("setup world — roles and orgs", async () => {
    // Create society node for explore to discover entities
    graph.addNode("society", "society");

    await roleSystem.execute("born", {
      name: "alice",
      source: "Feature: Alice\n  Scenario: Who\n    Given I am Alice the engineer",
    });
    await roleSystem.execute("born", {
      name: "bob",
      source: "Feature: Bob\n  Scenario: Who\n    Given I am Bob the designer",
    });
    await orgSystem.execute("found", {
      name: "acme",
      source: "Feature: Acme Corp\n  Scenario: Mission\n    Given we build great products",
    });

    await individualSystem.execute("identity", { roleId: "alice" });
  });

  test("explore — list all roles and orgs", async () => {
    const result = await individualSystem.execute("explore", {});
    expect(result).toContain("[alice] RoleX World");
    expect(result).toContain("acme (org)");
    expect(result).toContain("alice");
    expect(result).toContain("bob");
  });

  test("explore(name) — role detail", async () => {
    const result = await individualSystem.execute("explore", { name: "bob" });
    expect(result).toContain("[alice]");
    expect(result).toContain("exploring: bob");
    expect(result).toContain("Feature: Bob");
    expect(result).toContain("I am Bob the designer");
  });

  test("explore(name) — org detail", async () => {
    const result = await individualSystem.execute("explore", { name: "acme" });
    expect(result).toContain("[alice]");
    expect(result).toContain("exploring: acme");
    expect(result).toContain("Feature: Acme Corp");
    expect(result).toContain("we build great products");
  });

  test("explore(name) — not found", async () => {
    try {
      await individualSystem.execute("explore", { name: "nonexistent" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.message).toContain("not found");
    }
  });
});
