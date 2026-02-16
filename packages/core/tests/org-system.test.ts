import { describe, expect, test } from "bun:test";
import {
  createGovernanceSystem,
  createOrgSystem,
  createRoleSystem,
  RoleXGraph,
} from "@rolexjs/core";
import { MemoryPlatform } from "./memory-platform";

describe("Organization System + Governance System — full lifecycle", () => {
  const graph = new RoleXGraph();
  const platform = new MemoryPlatform();
  const roleSystem = createRoleSystem(graph, platform);
  const orgSystem = createOrgSystem(graph, platform);
  const govSystem = createGovernanceSystem(graph, platform);

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
    expect(graph.hasNode("alice")).toBe(true);
    expect(graph.hasNode("bob")).toBe(true);
  });

  // ===== Organization System (external) =====

  test("found — create organization", async () => {
    const result = await orgSystem.execute("found", {
      name: "deepractice",
      source:
        "Feature: Deepractice Charter\n  Scenario: Mission\n    Given we build AI agent tools",
    });
    expect(result).toContain("[deepractice] founded");
    expect(graph.hasNode("deepractice")).toBe(true);
    expect(graph.getNode("deepractice")?.type).toBe("organization");
    // Charter node linked
    expect(graph.hasNode("deepractice/charter")).toBe(true);
    expect(platform.readContent("deepractice/charter")).not.toBeNull();
  });

  // ===== Governance System (internal) =====

  test("rule — write charter entry", async () => {
    const result = await govSystem.execute("rule", {
      orgName: "deepractice",
      name: "code-standards",
      source:
        "Feature: Code Standards\n  Scenario: TypeScript only\n    Given all code must be TypeScript",
    });
    expect(result).toContain("[deepractice] charter: code-standards");
    expect(graph.hasNode("deepractice/code-standards")).toBe(true);
  });

  test("establish — create position", async () => {
    const result = await govSystem.execute("establish", {
      orgName: "deepractice",
      name: "cto",
      source:
        "Feature: CTO Duties\n  Scenario: Technical leadership\n    Given lead technical architecture",
    });
    expect(result).toContain("[deepractice] established: cto");
    // Position node linked to org
    expect(graph.hasNode("deepractice/cto")).toBe(true);
    expect(graph.getNode("deepractice/cto")?.type).toBe("position");
  });

  test("establish — create second position", async () => {
    await govSystem.execute("establish", {
      orgName: "deepractice",
      name: "engineer",
      source:
        "Feature: Engineer Duties\n  Scenario: Build features\n    Given implement product features",
    });
    expect(graph.hasNode("deepractice/engineer")).toBe(true);
    expect(graph.getNode("deepractice/engineer")?.type).toBe("position");
  });

  test("assign — update duty for position", async () => {
    const result = await govSystem.execute("assign", {
      positionName: "deepractice/cto",
      name: "architecture",
      source:
        "Feature: Architecture Duty\n  Scenario: System design\n    Given design system architecture",
    });
    expect(result).toContain("duty: architecture");
  });

  test("hire — add members", async () => {
    const r1 = await govSystem.execute("hire", { orgName: "deepractice", roleName: "alice" });
    const r2 = await govSystem.execute("hire", { orgName: "deepractice", roleName: "bob" });
    expect(r1).toContain("[deepractice] hired: alice");
    expect(r2).toContain("[deepractice] hired: bob");
    // Membership is undirected edge
    expect(graph.hasEdge("deepractice", "alice")).toBe(true);
    expect(graph.hasEdge("deepractice", "bob")).toBe(true);
  });

  test("appoint — assign role to position", async () => {
    const r1 = await govSystem.execute("appoint", {
      roleName: "alice",
      positionName: "deepractice/cto",
    });
    const r2 = await govSystem.execute("appoint", {
      roleName: "bob",
      positionName: "deepractice/engineer",
    });
    expect(r1).toContain("[alice] appointed to: deepractice/cto");
    expect(r2).toContain("[bob] appointed to: deepractice/engineer");
    // Assignment is undirected edge
    expect(graph.hasEdge("deepractice/cto", "alice")).toBe(true);
    expect(graph.hasEdge("deepractice/engineer", "bob")).toBe(true);
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
    const result = await govSystem.execute("dismiss", {
      roleName: "bob",
      positionName: "deepractice/engineer",
    });
    expect(result).toContain("[bob] dismissed from: deepractice/engineer");
    expect(graph.hasEdge("deepractice/engineer", "bob")).toBe(false);
  });

  test("fire — remove from org (auto-dismiss)", async () => {
    await govSystem.execute("appoint", { roleName: "bob", positionName: "deepractice/engineer" });
    expect(graph.hasEdge("deepractice/engineer", "bob")).toBe(true);

    const result = await govSystem.execute("fire", { orgName: "deepractice", roleName: "bob" });
    expect(result).toContain("[deepractice] fired: bob");
    expect(graph.hasEdge("deepractice", "bob")).toBe(false);
    expect(graph.hasEdge("deepractice/engineer", "bob")).toBe(false);
  });

  test("abolish — remove position", async () => {
    const result = await govSystem.execute("abolish", { orgName: "deepractice", name: "engineer" });
    expect(result).toContain("[deepractice] abolished: engineer");
    // Position node shadowed (cascade)
    expect(graph.getNode("deepractice/engineer")?.shadow).toBe(true);
  });

  // ===== Organization System (lifecycle end) =====

  test("dissolve — destroy organization", async () => {
    const result = await orgSystem.execute("dissolve", { name: "deepractice" });
    expect(result).toContain("[deepractice] dissolved");
    // Org node shadowed (cascade to charter, positions, etc.)
    expect(graph.getNode("deepractice")?.shadow).toBe(true);
  });
});
