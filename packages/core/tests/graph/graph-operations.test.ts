/**
 * Verify that ALL upper-layer RoleX operations can be expressed
 * purely as graph primitives (node, edge, shadow, state).
 *
 * Each test simulates a real system operation using only RoleXGraph.
 * Content (Feature) is represented as a mock string key — in production
 * it would be loaded on demand via Platform.readContent().
 */

import { describe, expect, it } from "bun:test";
import { RoleXGraph } from "../../src/graph/RoleXGraph.js";

// ===== Helper: simulate content storage (Platform responsibility) =====

class MockContentStore {
  private store = new Map<string, unknown>();

  write(key: string, content: unknown): void {
    this.store.set(key, content);
  }

  read(key: string): unknown | undefined {
    return this.store.get(key);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

// ===== Helper: graph query utilities (would be in RoleXGraph or a thin util layer) =====

/** Get active (non-shadow) outbound neighbors by edge type. */
function activeOut(g: RoleXGraph, key: string, edgeType?: string): string[] {
  return g.outNeighbors(key, edgeType).filter((k) => !g.getNode(k)!.shadow);
}

/** Get active (non-shadow) neighbors by edge type. */
function activeNeighbors(g: RoleXGraph, key: string, edgeType?: string): string[] {
  return g.neighbors(key, edgeType).filter((k) => !g.getNode(k)!.shadow);
}

/** Get active nodes by type. */
function _activeByType(g: RoleXGraph, type: string): string[] {
  return g.findNodes((_k, a) => a.type === type && !a.shadow);
}

describe("Graph-based RoleX operations", () => {
  // ========== Role System ==========

  describe("Role System", () => {
    it("born — create role in society", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      // Society exists as root node
      g.addNode("society", "society");

      // born("sean", personaSource)
      g.addNode("sean", "role");
      g.relate("society", "sean", "has-role");

      g.addNode("sean/persona", "persona");
      g.relateTo("sean", "sean/persona", "has-info");
      content.write("sean/persona", { name: "Sean", type: "persona" });

      // Verify
      expect(g.neighbors("society", "has-role")).toContain("sean");
      expect(g.outNeighbors("sean", "has-info")).toContain("sean/persona");
      expect(content.has("sean/persona")).toBe(true);
    });

    it("teach — add knowledge.pattern to role", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");

      // teach("sean", "typescript", source)
      g.addNode("sean/typescript", "knowledge.pattern");
      g.relateTo("sean", "sean/typescript", "has-info");
      content.write("sean/typescript", { name: "TypeScript", type: "knowledge.pattern" });

      expect(activeOut(g, "sean", "has-info")).toContain("sean/typescript");
    });

    it("train — add knowledge.procedure to role", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");

      // train("sean", "code-review", source)
      g.addNode("sean/code-review", "knowledge.procedure");
      g.relateTo("sean", "sean/code-review", "has-info");
      content.write("sean/code-review", { name: "Code Review", type: "knowledge.procedure" });

      const procedures = activeOut(g, "sean", "has-info").filter(
        (k) => g.getNode(k)!.type === "knowledge.procedure"
      );
      expect(procedures).toEqual(["sean/code-review"]);
    });

    it("retire — shadow entire role", () => {
      const g = new RoleXGraph();

      g.addNode("society", "society");
      g.addNode("sean", "role");
      g.relate("society", "sean", "has-role");

      g.addNode("sean/persona", "persona");
      g.relateTo("sean", "sean/persona", "has-info");
      g.addNode("sean/goal1", "goal");
      g.relateTo("sean", "sean/goal1", "has-goal");

      // retire("sean")
      g.shadow("sean");

      expect(g.getNode("sean")!.shadow).toBe(true);
      expect(g.getNode("sean/persona")!.shadow).toBe(true);
      expect(g.getNode("sean/goal1")!.shadow).toBe(true);
      // Society is NOT shadowed (undirected edge, not outbound)
      expect(g.getNode("society")!.shadow).toBe(false);

      // Active roles in society
      const activeRoles = activeNeighbors(g, "society", "has-role");
      expect(activeRoles).toEqual([]);
    });
  });

  // ========== Individual System ==========

  describe("Individual System", () => {
    /** Setup a role with basic identity. */
    function setupRole(g: RoleXGraph, content: MockContentStore) {
      g.addNode("society", "society");
      g.addNode("sean", "role");
      g.relate("society", "sean", "has-role");

      g.addNode("sean/persona", "persona");
      g.relateTo("sean", "sean/persona", "has-info");
      content.write("sean/persona", { name: "Sean" });

      g.addNode("sean/ts-pattern", "knowledge.pattern");
      g.relateTo("sean", "sean/ts-pattern", "has-info");
      content.write("sean/ts-pattern", { name: "TypeScript" });

      g.addNode("sean/code-review", "knowledge.procedure");
      g.relateTo("sean", "sean/code-review", "has-info");
      content.write("sean/code-review", { name: "Code Review" });
    }

    it("identity — load all role information", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();
      setupRole(g, content);

      // identity("sean")
      const allInfo = activeOut(g, "sean", "has-info");

      expect(allInfo).toHaveLength(3);
      expect(allInfo).toContain("sean/persona");
      expect(allInfo).toContain("sean/ts-pattern");
      expect(allInfo).toContain("sean/code-review");

      // Group by type
      const byType: Record<string, string[]> = {};
      for (const key of allInfo) {
        const type = g.getNode(key)!.type;
        if (!byType[type]) byType[type] = [];
        byType[type].push(key);
      }

      expect(byType.persona).toHaveLength(1);
      expect(byType["knowledge.pattern"]).toHaveLength(1);
      expect(byType["knowledge.procedure"]).toHaveLength(1);
    });

    it("want — declare a goal", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();
      setupRole(g, content);

      // want("build-mvp", source)
      g.addNode("sean/build-mvp", "goal");
      g.relateTo("sean", "sean/build-mvp", "has-goal");
      content.write("sean/build-mvp", { name: "Build MVP" });

      // Auto focus
      g.updateNode("sean", { state: { focus: "sean/build-mvp" } });

      expect(activeOut(g, "sean", "has-goal")).toContain("sean/build-mvp");
      expect(g.getNode("sean")!.state.focus).toBe("sean/build-mvp");
    });

    it("focus — read current goal context", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();
      setupRole(g, content);

      // want two goals
      g.addNode("sean/goal1", "goal");
      g.relateTo("sean", "sean/goal1", "has-goal");
      g.addNode("sean/goal2", "goal");
      g.relateTo("sean", "sean/goal2", "has-goal");
      g.updateNode("sean", { state: { focus: "sean/goal1" } });

      // design a plan
      g.addNode("sean/plan1", "plan");
      g.relateTo("sean/goal1", "sean/plan1", "has-plan");
      g.updateNode("sean/goal1", { state: { focusPlan: "sean/plan1" } });

      // add tasks
      g.addNode("sean/task1", "task");
      g.addNode("sean/task2", "task");
      g.relateTo("sean/plan1", "sean/task1", "has-task");
      g.relateTo("sean/plan1", "sean/task2", "has-task");

      // focus() — read the whole context
      const focusGoalKey = g.getNode("sean")!.state.focus as string;
      expect(focusGoalKey).toBe("sean/goal1");

      const focusPlanKey = g.getNode(focusGoalKey)!.state.focusPlan as string;
      expect(focusPlanKey).toBe("sean/plan1");

      const plans = activeOut(g, focusGoalKey, "has-plan");
      expect(plans).toEqual(["sean/plan1"]);

      const tasks = activeOut(g, focusPlanKey, "has-task");
      expect(tasks).toHaveLength(2);

      const otherGoals = activeOut(g, "sean", "has-goal").filter((k) => k !== focusGoalKey);
      expect(otherGoals).toEqual(["sean/goal2"]);
    });

    it("focus switch — change focused goal", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "role");
      g.addNode("sean/goal1", "goal");
      g.addNode("sean/goal2", "goal");
      g.relateTo("sean", "sean/goal1", "has-goal");
      g.relateTo("sean", "sean/goal2", "has-goal");
      g.updateNode("sean", { state: { focus: "sean/goal1" } });

      // focus("goal2")
      g.updateNode("sean", { state: { focus: "sean/goal2" } });

      expect(g.getNode("sean")!.state.focus).toBe("sean/goal2");
    });

    it("design — create plan for goal", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/build-mvp", "goal");
      g.relateTo("sean", "sean/build-mvp", "has-goal");
      g.updateNode("sean", { state: { focus: "sean/build-mvp" } });

      // design("mvp-plan", source)
      g.addNode("sean/mvp-plan", "plan");
      g.relateTo("sean/build-mvp", "sean/mvp-plan", "has-plan");
      content.write("sean/mvp-plan", { name: "MVP Plan" });

      // Auto focus plan
      g.updateNode("sean/build-mvp", { state: { focusPlan: "sean/mvp-plan" } });

      const plans = activeOut(g, "sean/build-mvp", "has-plan");
      expect(plans).toEqual(["sean/mvp-plan"]);
      expect(g.getNode("sean/build-mvp")!.state.focusPlan).toBe("sean/mvp-plan");
    });

    it("todo — create task for plan", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/goal", "goal");
      g.addNode("sean/plan", "plan");
      g.relateTo("sean", "sean/goal", "has-goal");
      g.relateTo("sean/goal", "sean/plan", "has-plan");
      g.updateNode("sean", { state: { focus: "sean/goal" } });
      g.updateNode("sean/goal", { state: { focusPlan: "sean/plan" } });

      // todo("setup-db", source)
      g.addNode("sean/setup-db", "task");
      g.relateTo("sean/plan", "sean/setup-db", "has-task");
      content.write("sean/setup-db", { name: "Setup DB" });

      expect(activeOut(g, "sean/plan", "has-task")).toContain("sean/setup-db");
    });

    it("finish — mark task done", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/task1", "task");

      // finish("task1", conclusion)
      g.updateNode("sean/task1", { state: { done: true } });

      // Optional: write conclusion
      g.addNode("sean/task1-conclusion", "experience.conclusion");
      g.relateTo("sean/task1", "sean/task1-conclusion", "has-conclusion");
      content.write("sean/task1-conclusion", { name: "Task1 result" });

      expect(g.getNode("sean/task1")!.state.done).toBe(true);
      expect(activeOut(g, "sean/task1", "has-conclusion")).toEqual(["sean/task1-conclusion"]);
    });

    it("achieve — complete goal with experience", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/build-mvp", "goal");
      g.addNode("sean/plan1", "plan");
      g.addNode("sean/task1", "task");
      g.addNode("sean/task1-conclusion", "experience.conclusion");

      g.relateTo("sean", "sean/build-mvp", "has-goal");
      g.relateTo("sean/build-mvp", "sean/plan1", "has-plan");
      g.relateTo("sean/plan1", "sean/task1", "has-task");
      g.relateTo("sean/task1", "sean/task1-conclusion", "has-conclusion");

      g.updateNode("sean", { state: { focus: "sean/build-mvp" } });
      g.updateNode("sean/task1", { state: { done: true } });

      // achieve(experience)
      // 1. Mark goal done
      g.updateNode("sean/build-mvp", { state: { done: true } });

      // 2. Create insight
      g.addNode("sean/mvp-insight", "experience.insight");
      g.relateTo("sean", "sean/mvp-insight", "has-info");
      content.write("sean/mvp-insight", { name: "MVP Insight" });

      // 3. Consume conclusions (shadow them)
      const conclusions = activeOut(g, "sean/task1", "has-conclusion");
      for (const c of conclusions) {
        g.shadow(c, false);
      }

      // Verify
      expect(g.getNode("sean/build-mvp")!.state.done).toBe(true);
      expect(
        activeOut(g, "sean", "has-info").filter((k) => g.getNode(k)!.type === "experience.insight")
      ).toContain("sean/mvp-insight");
      expect(g.getNode("sean/task1-conclusion")!.shadow).toBe(true);
    });

    it("abandon — shadow goal with cascade", () => {
      const g = new RoleXGraph();

      g.addNode("sean", "role");
      g.addNode("sean/goal1", "goal");
      g.addNode("sean/plan1", "plan");
      g.addNode("sean/task1", "task");
      g.addNode("sean/task2", "task");
      g.addNode("sean/task1-conclusion", "experience.conclusion");

      g.relateTo("sean", "sean/goal1", "has-goal");
      g.relateTo("sean/goal1", "sean/plan1", "has-plan");
      g.relateTo("sean/plan1", "sean/task1", "has-task");
      g.relateTo("sean/plan1", "sean/task2", "has-task");
      g.relateTo("sean/task1", "sean/task1-conclusion", "has-conclusion");

      g.updateNode("sean", { state: { focus: "sean/goal1" } });

      // abandon — just one call!
      g.shadow("sean/goal1");

      // Everything under goal is shadowed
      expect(g.getNode("sean/goal1")!.shadow).toBe(true);
      expect(g.getNode("sean/plan1")!.shadow).toBe(true);
      expect(g.getNode("sean/task1")!.shadow).toBe(true);
      expect(g.getNode("sean/task2")!.shadow).toBe(true);
      expect(g.getNode("sean/task1-conclusion")!.shadow).toBe(true);

      // Role is NOT shadowed
      expect(g.getNode("sean")!.shadow).toBe(false);

      // No active goals
      expect(activeOut(g, "sean", "has-goal")).toEqual([]);

      // Clear focus
      g.updateNode("sean", { state: { focus: null } });
      expect(g.getNode("sean")!.state.focus).toBeNull();
    });

    it("forget — shadow knowledge", () => {
      const g = new RoleXGraph();

      g.addNode("sean", "role");
      g.addNode("sean/old-pattern", "knowledge.pattern");
      g.relateTo("sean", "sean/old-pattern", "has-info");

      // forget("knowledge.pattern", "old-pattern")
      g.shadow("sean/old-pattern", false);

      expect(g.getNode("sean/old-pattern")!.shadow).toBe(true);

      // Not visible in active identity
      const activeInfo = activeOut(g, "sean", "has-info");
      expect(activeInfo).not.toContain("sean/old-pattern");
    });

    it("reflect — consume insights, create knowledge", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/insight1", "experience.insight");
      g.addNode("sean/insight2", "experience.insight");
      g.relateTo("sean", "sean/insight1", "has-info");
      g.relateTo("sean", "sean/insight2", "has-info");

      // reflect([insight1, insight2], "api-patterns", source)
      // 1. Create knowledge
      g.addNode("sean/api-patterns", "knowledge.pattern");
      g.relateTo("sean", "sean/api-patterns", "has-info");
      content.write("sean/api-patterns", { name: "API Patterns" });

      // 2. Consume insights (shadow them)
      g.shadow("sean/insight1", false);
      g.shadow("sean/insight2", false);

      // Verify: knowledge exists, insights consumed
      const activeInfo = activeOut(g, "sean", "has-info");
      expect(activeInfo).toContain("sean/api-patterns");
      expect(activeInfo).not.toContain("sean/insight1");
      expect(activeInfo).not.toContain("sean/insight2");

      // Insights still exist in shadow (recoverable)
      expect(g.hasNode("sean/insight1")).toBe(true);
      expect(g.getNode("sean/insight1")!.shadow).toBe(true);
    });

    it("contemplate — unify patterns into theory (patterns NOT consumed)", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("sean", "role");
      g.addNode("sean/pattern1", "knowledge.pattern");
      g.addNode("sean/pattern2", "knowledge.pattern");
      g.relateTo("sean", "sean/pattern1", "has-info");
      g.relateTo("sean", "sean/pattern2", "has-info");

      // contemplate([pattern1, pattern2], "unified-theory", source)
      g.addNode("sean/unified-theory", "knowledge.theory");
      g.relateTo("sean", "sean/unified-theory", "has-info");
      content.write("sean/unified-theory", { name: "Unified Theory" });

      // Patterns are NOT consumed
      const activeInfo = activeOut(g, "sean", "has-info");
      expect(activeInfo).toContain("sean/pattern1");
      expect(activeInfo).toContain("sean/pattern2");
      expect(activeInfo).toContain("sean/unified-theory");
    });

    it("explore — discover world structure", () => {
      const g = new RoleXGraph();

      g.addNode("society", "society");
      g.addNode("sean", "role");
      g.addNode("guider", "role");
      g.addNode("deepractice", "organization");

      g.relate("society", "sean", "has-role");
      g.relate("society", "guider", "has-role");
      g.relate("society", "deepractice", "has-org");
      g.relate("deepractice", "sean", "member");

      // explore() — list all
      const roles = activeNeighbors(g, "society", "has-role");
      const orgs = activeNeighbors(g, "society", "has-org");

      expect(roles).toContain("sean");
      expect(roles).toContain("guider");
      expect(orgs).toContain("deepractice");

      // explore("sean") — role detail
      const _seanInfo = activeOut(g, "sean", "has-info");
      const seanOrgs = activeNeighbors(g, "sean", "member");
      expect(seanOrgs).toContain("deepractice");

      // explore("deepractice") — org detail
      const members = activeNeighbors(g, "deepractice", "member");
      expect(members).toContain("sean");
    });
  });

  // ========== Organization System ==========

  describe("Organization System", () => {
    it("found — create organization", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("society", "society");

      // found("deepractice", charterSource)
      g.addNode("deepractice", "organization");
      g.relate("society", "deepractice", "has-org");

      g.addNode("deepractice/charter", "charter");
      g.relateTo("deepractice", "deepractice/charter", "has-info");
      content.write("deepractice/charter", { name: "Deepractice Charter" });

      expect(activeNeighbors(g, "society", "has-org")).toContain("deepractice");
    });

    it("dissolve — shadow organization", () => {
      const g = new RoleXGraph();

      g.addNode("society", "society");
      g.addNode("deepractice", "organization");
      g.addNode("deepractice/charter", "charter");
      g.relate("society", "deepractice", "has-org");
      g.relateTo("deepractice", "deepractice/charter", "has-info");

      // dissolve
      g.shadow("deepractice");

      expect(g.getNode("deepractice")!.shadow).toBe(true);
      expect(g.getNode("deepractice/charter")!.shadow).toBe(true);
      expect(activeNeighbors(g, "society", "has-org")).toEqual([]);
    });

    it("hire / fire — bidirectional membership", () => {
      const g = new RoleXGraph();

      g.addNode("deepractice", "organization");
      g.addNode("sean", "role");
      g.addNode("guider", "role");

      // hire
      g.relate("deepractice", "sean", "member");
      g.relate("deepractice", "guider", "member");

      expect(activeNeighbors(g, "deepractice", "member")).toHaveLength(2);
      expect(activeNeighbors(g, "sean", "member")).toContain("deepractice");

      // fire
      g.unrelate("deepractice", "guider");

      expect(activeNeighbors(g, "deepractice", "member")).toEqual(["sean"]);
      expect(activeNeighbors(g, "guider", "member")).toEqual([]);
    });

    it("establish / abolish — position management", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      g.addNode("deepractice", "organization");

      // establish("cto", dutySource)
      g.addNode("deepractice/cto", "position");
      g.relateTo("deepractice", "deepractice/cto", "has-position");
      content.write("deepractice/cto", { name: "CTO" });

      expect(activeOut(g, "deepractice", "has-position")).toContain("deepractice/cto");

      // abolish
      g.shadow("deepractice/cto", false);
      expect(activeOut(g, "deepractice", "has-position")).toEqual([]);
    });

    it("appoint / dismiss — role ↔ position assignment", () => {
      const g = new RoleXGraph();

      g.addNode("deepractice", "organization");
      g.addNode("deepractice/cto", "position");
      g.addNode("sean", "role");
      g.relateTo("deepractice", "deepractice/cto", "has-position");

      // appoint
      g.relate("deepractice/cto", "sean", "assigned");

      expect(activeNeighbors(g, "deepractice/cto", "assigned")).toEqual(["sean"]);
      expect(activeNeighbors(g, "sean", "assigned")).toContain("deepractice/cto");

      // dismiss
      g.unrelate("deepractice/cto", "sean");

      expect(activeNeighbors(g, "deepractice/cto", "assigned")).toEqual([]);
    });
  });

  // ========== Full Lifecycle ==========

  describe("Full lifecycle", () => {
    it("born → teach → want → design → todo → finish → achieve → reflect", () => {
      const g = new RoleXGraph();
      const content = new MockContentStore();

      // === born ===
      g.addNode("society", "society");
      g.addNode("sean", "role");
      g.relate("society", "sean", "has-role");
      g.addNode("sean/persona", "persona");
      g.relateTo("sean", "sean/persona", "has-info");

      // === teach ===
      g.addNode("sean/ts-knowledge", "knowledge.pattern");
      g.relateTo("sean", "sean/ts-knowledge", "has-info");

      // === identity ===
      const identity = activeOut(g, "sean", "has-info");
      expect(identity).toHaveLength(2);

      // === want ===
      g.addNode("sean/build-api", "goal");
      g.relateTo("sean", "sean/build-api", "has-goal");
      g.updateNode("sean", { state: { focus: "sean/build-api" } });

      // === design ===
      g.addNode("sean/api-plan", "plan");
      g.relateTo("sean/build-api", "sean/api-plan", "has-plan");
      g.updateNode("sean/build-api", { state: { focusPlan: "sean/api-plan" } });

      // === todo ===
      g.addNode("sean/design-schema", "task");
      g.addNode("sean/implement-routes", "task");
      g.relateTo("sean/api-plan", "sean/design-schema", "has-task");
      g.relateTo("sean/api-plan", "sean/implement-routes", "has-task");

      // === finish task 1 with conclusion ===
      g.updateNode("sean/design-schema", { state: { done: true } });
      g.addNode("sean/design-schema-conclusion", "experience.conclusion");
      g.relateTo("sean/design-schema", "sean/design-schema-conclusion", "has-conclusion");

      // === finish task 2 ===
      g.updateNode("sean/implement-routes", { state: { done: true } });

      // === achieve ===
      g.updateNode("sean/build-api", { state: { done: true } });
      g.addNode("sean/api-insight", "experience.insight");
      g.relateTo("sean", "sean/api-insight", "has-info");
      content.write("sean/api-insight", { name: "API Design Insight" });

      // Consume conclusions
      g.shadow("sean/design-schema-conclusion", false);

      // Verify achieve
      expect(g.getNode("sean/build-api")!.state.done).toBe(true);
      expect(
        activeOut(g, "sean", "has-info").filter((k) => g.getNode(k)!.type === "experience.insight")
      ).toContain("sean/api-insight");

      // === reflect ===
      g.addNode("sean/api-design-pattern", "knowledge.pattern");
      g.relateTo("sean", "sean/api-design-pattern", "has-info");
      g.shadow("sean/api-insight", false); // consume insight

      // Final identity check
      const finalInfo = activeOut(g, "sean", "has-info");
      const patterns = finalInfo.filter((k) => g.getNode(k)!.type === "knowledge.pattern");
      const insights = finalInfo.filter((k) => g.getNode(k)!.type === "experience.insight");

      expect(patterns).toHaveLength(2); // ts-knowledge + api-design-pattern
      expect(insights).toHaveLength(0); // consumed by reflect
    });

    it("multiple goals — abandon one, achieve another", () => {
      const g = new RoleXGraph();

      g.addNode("sean", "role");

      // Goal 1: will be abandoned
      g.addNode("sean/goal1", "goal");
      g.addNode("sean/plan1", "plan");
      g.addNode("sean/task1a", "task");
      g.relateTo("sean", "sean/goal1", "has-goal");
      g.relateTo("sean/goal1", "sean/plan1", "has-plan");
      g.relateTo("sean/plan1", "sean/task1a", "has-task");

      // Goal 2: will be achieved
      g.addNode("sean/goal2", "goal");
      g.addNode("sean/plan2", "plan");
      g.addNode("sean/task2a", "task");
      g.relateTo("sean", "sean/goal2", "has-goal");
      g.relateTo("sean/goal2", "sean/plan2", "has-plan");
      g.relateTo("sean/plan2", "sean/task2a", "has-task");

      g.updateNode("sean", { state: { focus: "sean/goal1" } });

      // Abandon goal1
      g.shadow("sean/goal1");
      g.updateNode("sean", { state: { focus: "sean/goal2" } });

      // Goal1 and children are shadowed
      expect(g.getNode("sean/goal1")!.shadow).toBe(true);
      expect(g.getNode("sean/plan1")!.shadow).toBe(true);
      expect(g.getNode("sean/task1a")!.shadow).toBe(true);

      // Goal2 is still active
      expect(g.getNode("sean/goal2")!.shadow).toBe(false);
      expect(g.getNode("sean/plan2")!.shadow).toBe(false);
      expect(g.getNode("sean/task2a")!.shadow).toBe(false);

      // Only goal2 visible
      const activeGoals = activeOut(g, "sean", "has-goal");
      expect(activeGoals).toEqual(["sean/goal2"]);

      // Achieve goal2
      g.updateNode("sean/goal2", { state: { done: true } });
      g.updateNode("sean/task2a", { state: { done: true } });

      expect(g.getNode("sean/goal2")!.state.done).toBe(true);
    });

    it("org with roles — dissolve cascades org, not roles", () => {
      const g = new RoleXGraph();

      g.addNode("society", "society");
      g.addNode("sean", "role");
      g.addNode("deepractice", "organization");
      g.addNode("deepractice/charter", "charter");
      g.addNode("deepractice/cto", "position");

      g.relate("society", "sean", "has-role");
      g.relate("society", "deepractice", "has-org");
      g.relateTo("deepractice", "deepractice/charter", "has-info");
      g.relateTo("deepractice", "deepractice/cto", "has-position");
      g.relate("deepractice", "sean", "member");
      g.relate("deepractice/cto", "sean", "assigned");

      // Dissolve org
      g.shadow("deepractice");

      // Org and its owned children are shadowed
      expect(g.getNode("deepractice")!.shadow).toBe(true);
      expect(g.getNode("deepractice/charter")!.shadow).toBe(true);
      expect(g.getNode("deepractice/cto")!.shadow).toBe(true);

      // Role is NOT shadowed (undirected member edge, not outbound from org)
      expect(g.getNode("sean")!.shadow).toBe(false);
      expect(g.getNode("society")!.shadow).toBe(false);
    });
  });
});
