import { describe, test, expect } from "bun:test";
import { createRoleSystem, createIndividualSystem } from "@rolexjs/core";
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

  test("focus — check current goal", async () => {
    const result = await individualSystem.execute("focus", {});
    expect(result).toContain("[sean] goal: build-mvp");
  });

  test("design — create plan", async () => {
    const result = await individualSystem.execute("design", {
      source: "Feature: MVP Plan\n  Scenario: Phase 1\n    Given setup the database",
    });
    expect(result).toContain("[sean] plan for build-mvp");
  });

  test("todo — create task", async () => {
    const result = await individualSystem.execute("todo", {
      name: "setup-db",
      source: "Feature: Setup DB\n  Scenario: Create tables\n    Given I run migrations",
    });
    expect(result).toContain("[sean] todo: setup-db");
  });

  test("focus — shows plan and tasks", async () => {
    const result = await individualSystem.execute("focus", {});
    expect(result).toContain("Plan: MVP Plan");
    expect(result).toContain("Setup DB");
  });

  test("finish — complete task with experience", async () => {
    const result = await individualSystem.execute("finish", {
      name: "setup-db",
      experience: {
        name: "db-setup-learnings",
        source: "Feature: DB Setup Learnings\n  Scenario: Migrations matter\n    Given I learned to always test migrations",
      },
    });
    expect(result).toContain("[sean] finished: setup-db");
    expect(result).toContain("synthesized: db-setup-learnings");
  });

  test("synthesize — record experience", async () => {
    const result = await individualSystem.execute("synthesize", {
      name: "mvp-insight",
      source: "Feature: MVP Insight\n  Scenario: Speed matters\n    Given shipping fast beats perfection",
    });
    expect(result).toContain("[sean] synthesized: mvp-insight");
  });

  test("achieve — complete goal", async () => {
    const result = await individualSystem.execute("achieve", {
      experience: {
        name: "mvp-achievement",
        source: "Feature: MVP Done\n  Scenario: We shipped\n    Given the MVP is live",
      },
    });
    expect(result).toContain("[sean] achieved: build-mvp");
    expect(result).toContain("synthesized: mvp-achievement");
  });

  test("reflect — distill experience into knowledge", async () => {
    const result = await individualSystem.execute("reflect", {
      experienceNames: ["db-setup-learnings", "mvp-insight", "mvp-achievement"],
      knowledgeName: "shipping-principles",
      knowledgeSource: "Feature: Shipping Principles\n  Scenario: Key lessons\n    Given test migrations early\n    And ship fast, iterate later",
    });
    expect(result).toContain("[sean] reflected");
    expect(result).toContain("shipping-principles");
    expect(platform.readInformation("sean", "experience", "db-setup-learnings")).toBeNull();
    expect(platform.readInformation("sean", "knowledge", "shipping-principles")).not.toBeNull();
  });

  test("apply — load procedure", async () => {
    const result = await individualSystem.execute("apply", { name: "code-review" });
    expect(result).toContain("[sean] applying: code-review");
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
