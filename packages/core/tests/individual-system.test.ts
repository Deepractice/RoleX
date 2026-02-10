import { describe, test, expect } from "bun:test";
import { createRoleSystem, createIndividualSystem, createOrgSystem } from "@rolexjs/core";
import { MemoryPlatform } from "./memory-platform";

describe("Role System + Individual System — full lifecycle", () => {
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(platform);
  const individualSystem = createIndividualSystem(platform);

  // ===== Role System (external) =====

  test("born — create a role", async () => {
    const result = await roleSystem.execute("born", {
      name: "sean",
      source: 'Feature: I am Sean\n  Scenario: Background\n    Given I am a backend architect',
    });
    expect(result).toContain("[sean] born");
    expect(platform.hasStructure("sean")).toBe(true);
  });

  test("teach — add knowledge", async () => {
    const result = await roleSystem.execute("teach", {
      roleId: "sean",
      name: "typescript",
      source: "Feature: TypeScript\n  Scenario: Basics\n    Given I know TypeScript well",
    });
    expect(result).toContain("[sean] taught: typescript");
  });

  test("train — add procedure", async () => {
    const result = await roleSystem.execute("train", {
      roleId: "sean",
      name: "code-review",
      source: "Feature: Code Review\n  Scenario: How to review\n    Given I read the diff first",
    });
    expect(result).toContain("[sean] trained: code-review");
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
    expect(platform.listRelations("focus", "sean")).toContain("build-mvp");
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
    // Verify relations
    expect(platform.listRelations("has-plan.build-mvp", "sean")).toContain("mvp-plan");
    expect(platform.listRelations("focus-plan.build-mvp", "sean")).toContain("mvp-plan");
  });

  test("todo — create task (auto-associates with focused plan)", async () => {
    const result = await individualSystem.execute("todo", {
      name: "setup-db",
      source: "Feature: Setup DB\n  Scenario: Create tables\n    Given I run migrations",
    });
    expect(result).toContain("[sean] todo: setup-db (plan: mvp-plan)");
    // Verify relation
    expect(platform.listRelations("has-task.mvp-plan", "sean")).toContain("setup-db");
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
      conclusion: "Feature: DB Setup Complete\n  Scenario: Result\n    Given migrations ran successfully\n    And all tables created",
    });
    expect(result).toContain("[sean] finished: setup-db");
    expect(result).toContain("conclusion: setup-db");
  });

  test("focus — finished task shows @done", async () => {
    const result = await individualSystem.execute("focus", {});
    expect(result).toContain("[setup-db] @done");
  });

  test("achieve — complete goal with conclusion + experience", async () => {
    const result = await individualSystem.execute("achieve", {
      conclusion: "Feature: MVP Conclusion\n  Scenario: Summary\n    Given the MVP was shipped on time\n    And all core features working",
      experience: {
        name: "mvp-achievement",
        source: "Feature: MVP Done\n  Scenario: We shipped\n    Given the MVP is live\n    And shipping fast beats perfection",
      },
    });
    expect(result).toContain("[sean] achieved: build-mvp");
    expect(result).toContain("conclusion: build-mvp");
    expect(result).toContain("synthesized: mvp-achievement");
    // Verify experience was written
    expect(platform.readInformation("sean", "experience.insight", "mvp-achievement")).not.toBeNull();
    // Verify conclusion was written
    expect(platform.readInformation("sean", "experience.conclusion", "build-mvp")).not.toBeNull();
  });

  test("reflect — distill experience into knowledge", async () => {
    const result = await individualSystem.execute("reflect", {
      experienceNames: ["mvp-achievement"],
      knowledgeName: "shipping-principles",
      knowledgeSource: "Feature: Shipping Principles\n  Scenario: Key lessons\n    Given test migrations early\n    And ship fast, iterate later",
    });
    expect(result).toContain("[sean] reflected");
    expect(result).toContain("shipping-principles");
    expect(platform.readInformation("sean", "experience.insight", "mvp-achievement")).toBeNull();
    expect(platform.readInformation("sean", "knowledge.pattern", "shipping-principles")).not.toBeNull();
  });

  test("skill — load procedure", async () => {
    const result = await individualSystem.execute("skill", { name: "code-review" });
    expect(result).toContain("[sean] skill loaded: code-review");
    expect(result).toContain("Code Review");
  });

  // ===== Role System (lifecycle end) =====

  test("retire — archive role", async () => {
    const result = await roleSystem.execute("retire", { name: "sean" });
    expect(result).toContain("[sean] retired");
    const persona = platform.readInformation("sean", "persona", "persona");
    expect(persona?.tags?.some((t: any) => t.name === "@retired")).toBe(true);
  });

  test("kill — destroy role", async () => {
    await roleSystem.execute("born", {
      name: "temp",
      source: "Feature: Temp\n  Scenario: Throwaway\n    Given temporary role",
    });
    expect(platform.hasStructure("temp")).toBe(true);

    const result = await roleSystem.execute("kill", { name: "temp" });
    expect(result).toContain("[temp] killed");
    expect(platform.readInformation("temp", "persona", "persona")).toBeNull();
  });
});

describe("Multi-goal, multi-plan hierarchy", () => {
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(platform);
  const individualSystem = createIndividualSystem(platform);

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
    expect(platform.listRelations("focus", "dev")).toContain("goal-a");
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
    const plans = platform.listRelations("has-plan.goal-a", "dev");
    expect(plans).toContain("plan-a1");
    expect(plans).toContain("plan-a2");

    // plan-a2 is focused (latest design)
    expect(platform.listRelations("focus-plan.goal-a", "dev")).toEqual(["plan-a2"]);
  });

  test("todo creates tasks under focused plan (plan-a2)", async () => {
    await individualSystem.execute("todo", {
      name: "task-1",
      source: "Feature: Task 1\n  Scenario: Do thing\n    Given I do the first thing",
    });

    expect(platform.listRelations("has-task.plan-a2", "dev")).toContain("task-1");
    // No tasks under plan-a1
    expect(platform.listRelations("has-task.plan-a1", "dev")).toEqual([]);
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

    // Other goals listed (Feature names)
    expect(result).toContain("Other goals: Goal B");
  });

  test("switch focus to goal-b", async () => {
    const result = await individualSystem.execute("focus", { name: "goal-b" });

    expect(result).toContain("goal: goal-b");
    expect(result).toContain("Feature: Goal B");
    // No plans for goal-b
    expect(result).toContain("Plans: none");
    // Other goals (Feature names)
    expect(result).toContain("Other goals: Goal A");
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

    expect(platform.listRelations("has-plan.goal-b", "dev")).toContain("plan-b1");
    expect(platform.listRelations("has-task.plan-b1", "dev")).toContain("task-b1");
  });

  test("switch back to goal-a retains focus-plan", async () => {
    const result = await individualSystem.execute("focus", { name: "goal-a" });

    // goal-a's focused plan is still plan-a2
    expect(result).toContain("Plans (focused: plan-a2)");
    expect(result).toContain("Feature: Task 1");
  });
});

describe("Explore — discover the RoleX world", () => {
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(platform);
  const orgSystem = createOrgSystem(platform);
  const individualSystem = createIndividualSystem(platform);

  test("setup world — roles and orgs", async () => {
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
    expect(result).toContain("├── alice");
    expect(result).toContain("├── bob");
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
