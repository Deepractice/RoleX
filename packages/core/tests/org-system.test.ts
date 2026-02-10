import { describe, test, expect } from "bun:test";
import {
  createRoleSystem,
  createOrgSystem,
  createGovernanceSystem,
} from "@rolexjs/core";
import { MemoryPlatform } from "./memory-platform";

describe("Organization System + Governance System — full lifecycle", () => {
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(platform);
  const orgSystem = createOrgSystem(platform);
  const govSystem = createGovernanceSystem(platform);

  // ===== Setup: create roles =====

  test("setup — born roles", async () => {
    await roleSystem.execute("born", {
      name: "alice",
      source: "Feature: I am Alice\n  Scenario: Background\n    Given I am a product manager",
    });
    await roleSystem.execute("born", {
      name: "bob",
      source: "Feature: I am Bob\n  Scenario: Background\n    Given I am an engineer",
    });
    expect(platform.hasStructure("alice")).toBe(true);
    expect(platform.hasStructure("bob")).toBe(true);
  });

  // ===== Organization System (external) =====

  test("found — create organization", async () => {
    const result = await orgSystem.execute("found", {
      name: "deepractice",
      source: "Feature: Deepractice Charter\n  Scenario: Mission\n    Given we build AI agent tools",
    });
    expect(result).toContain("[deepractice] founded");
    expect(platform.hasStructure("deepractice")).toBe(true);
    expect(platform.readInformation("deepractice", "charter", "charter")).not.toBeNull();
  });

  // ===== Governance System (internal) =====

  test("rule — write charter entry", async () => {
    const result = await govSystem.execute("rule", {
      orgName: "deepractice",
      name: "code-standards",
      source: "Feature: Code Standards\n  Scenario: TypeScript only\n    Given all code must be TypeScript",
    });
    expect(result).toContain("[deepractice] charter: code-standards");
  });

  test("establish — create position", async () => {
    const result = await govSystem.execute("establish", {
      orgName: "deepractice",
      name: "cto",
      source: "Feature: CTO Duties\n  Scenario: Technical leadership\n    Given lead technical architecture",
    });
    expect(result).toContain("[deepractice] established: cto");
    expect(platform.hasStructure("cto", "deepractice")).toBe(true);
  });

  test("establish — create second position", async () => {
    await govSystem.execute("establish", {
      orgName: "deepractice",
      name: "engineer",
      source: "Feature: Engineer Duties\n  Scenario: Build features\n    Given implement product features",
    });
    expect(platform.hasStructure("engineer", "deepractice")).toBe(true);
  });

  test("assign — update duty for position", async () => {
    const result = await govSystem.execute("assign", {
      positionName: "cto",
      name: "architecture",
      source: "Feature: Architecture Duty\n  Scenario: System design\n    Given design system architecture",
    });
    expect(result).toContain("[cto] duty: architecture");
  });

  test("hire — add members", async () => {
    const r1 = await govSystem.execute("hire", { orgName: "deepractice", roleName: "alice" });
    const r2 = await govSystem.execute("hire", { orgName: "deepractice", roleName: "bob" });
    expect(r1).toContain("[deepractice] hired: alice");
    expect(r2).toContain("[deepractice] hired: bob");
    expect(platform.hasRelation("membership", "deepractice", "alice")).toBe(true);
    expect(platform.hasRelation("membership", "deepractice", "bob")).toBe(true);
  });

  test("appoint — assign role to position", async () => {
    const r1 = await govSystem.execute("appoint", { roleName: "alice", positionName: "cto" });
    const r2 = await govSystem.execute("appoint", { roleName: "bob", positionName: "engineer" });
    expect(r1).toContain("[alice] appointed to: cto");
    expect(r2).toContain("[bob] appointed to: engineer");
    expect(platform.hasRelation("assignment", "alice", "cto")).toBe(true);
    expect(platform.hasRelation("assignment", "bob", "engineer")).toBe(true);
  });

  test("directory — query organization", async () => {
    const result = await govSystem.execute("directory", { orgName: "deepractice" });
    expect(result).toContain("[deepractice] directory");
    expect(result).toContain("alice");
    expect(result).toContain("bob");
    expect(result).toContain("cto");
    expect(result).toContain("engineer");
  });

  test("dismiss — remove from position", async () => {
    const result = await govSystem.execute("dismiss", { roleName: "bob", positionName: "engineer" });
    expect(result).toContain("[bob] dismissed from: engineer");
    expect(platform.hasRelation("assignment", "bob", "engineer")).toBe(false);
  });

  test("fire — remove from org (auto-dismiss)", async () => {
    await govSystem.execute("appoint", { roleName: "bob", positionName: "engineer" });
    expect(platform.hasRelation("assignment", "bob", "engineer")).toBe(true);

    const result = await govSystem.execute("fire", { orgName: "deepractice", roleName: "bob" });
    expect(result).toContain("[deepractice] fired: bob");
    expect(platform.hasRelation("membership", "deepractice", "bob")).toBe(false);
    expect(platform.hasRelation("assignment", "bob", "engineer")).toBe(false);
  });

  test("abolish — remove position", async () => {
    const result = await govSystem.execute("abolish", { orgName: "deepractice", name: "engineer" });
    expect(result).toContain("[deepractice] abolished: engineer");
    expect(platform.hasStructure("engineer", "deepractice")).toBe(false);
  });

  // ===== Organization System (lifecycle end) =====

  test("dissolve — destroy organization", async () => {
    const result = await orgSystem.execute("dissolve", { name: "deepractice" });
    expect(result).toContain("[deepractice] dissolved");
    expect(platform.hasStructure("deepractice")).toBe(false);
    expect(platform.readInformation("deepractice", "charter", "charter")).toBeNull();
  });
});
