import { describe, it, expect } from "bun:test";
import { RoleXGraph } from "../../src/graph/RoleXGraph.js";

describe("RoleXGraph", () => {
  // ===== Node =====

  describe("node operations", () => {
    it("should add and get a node", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");

      const attrs = g.getNode("sean");
      expect(attrs).toBeDefined();
      expect(attrs!.type).toBe("persona");
      expect(attrs!.shadow).toBe(false);
      expect(attrs!.state).toEqual({});
    });

    it("should return undefined for non-existent node", () => {
      const g = new RoleXGraph();
      expect(g.getNode("nope")).toBeUndefined();
    });

    it("should check node existence", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");

      expect(g.hasNode("sean")).toBe(true);
      expect(g.hasNode("nope")).toBe(false);
    });

    it("should update node attributes", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");

      g.updateNode("sean", { state: { focus: "build-mvp" } });

      const attrs = g.getNode("sean");
      expect(attrs!.state).toEqual({ focus: "build-mvp" });
      expect(attrs!.type).toBe("persona"); // unchanged
    });

    it("should drop a node", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");
      g.dropNode("sean");

      expect(g.hasNode("sean")).toBe(false);
    });

    it("should find nodes by filter", () => {
      const g = new RoleXGraph();
      g.addNode("sean-persona", "persona");
      g.addNode("build-mvp", "goal");
      g.addNode("mvp-plan", "plan");
      g.addNode("setup-db", "task");

      const goals = g.findNodes((_key, attrs) => attrs.type === "goal");
      expect(goals).toEqual(["build-mvp"]);

      const all = g.findNodes(() => true);
      expect(all).toHaveLength(4);
    });

    it("should report order", () => {
      const g = new RoleXGraph();
      g.addNode("a", "persona");
      g.addNode("b", "goal");

      expect(g.order()).toBe(2);
    });
  });

  // ===== Edge =====

  describe("edge operations", () => {
    it("should create undirected (bidirectional) edge", () => {
      const g = new RoleXGraph();
      g.addNode("deepractice", "charter");
      g.addNode("sean", "persona");

      g.relate("deepractice", "sean", "member");

      // Bidirectional — both directions return true
      expect(g.hasEdge("deepractice", "sean")).toBe(true);
      expect(g.hasEdge("sean", "deepractice")).toBe(true);
    });

    it("should create directed edge", () => {
      const g = new RoleXGraph();
      g.addNode("build-mvp", "goal");
      g.addNode("mvp-plan", "plan");

      g.relateTo("build-mvp", "mvp-plan", "has-plan");

      expect(g.hasEdge("build-mvp", "mvp-plan")).toBe(true);
      // Directed — reverse is NOT an edge
      expect(g.hasEdge("mvp-plan", "build-mvp")).toBe(false);
    });

    it("should remove edge", () => {
      const g = new RoleXGraph();
      g.addNode("a", "persona");
      g.addNode("b", "persona");
      g.relate("a", "b", "member");

      g.unrelate("a", "b");

      expect(g.hasEdge("a", "b")).toBe(false);
    });

    it("should get neighbors without filter", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");
      g.addNode("goal1", "goal");
      g.addNode("goal2", "goal");
      g.addNode("org1", "charter");

      g.relateTo("sean", "goal1", "has-goal");
      g.relateTo("sean", "goal2", "has-goal");
      g.relate("org1", "sean", "member");

      const all = g.neighbors("sean");
      expect(all).toHaveLength(3);
      expect(all).toContain("goal1");
      expect(all).toContain("goal2");
      expect(all).toContain("org1");
    });

    it("should get neighbors with edge type filter", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");
      g.addNode("goal1", "goal");
      g.addNode("goal2", "goal");
      g.addNode("org1", "charter");

      g.relateTo("sean", "goal1", "has-goal");
      g.relateTo("sean", "goal2", "has-goal");
      g.relate("org1", "sean", "member");

      const goals = g.neighbors("sean", "has-goal");
      expect(goals).toHaveLength(2);
      expect(goals).toContain("goal1");
      expect(goals).toContain("goal2");

      const members = g.neighbors("sean", "member");
      expect(members).toEqual(["org1"]);
    });

    it("should get outbound neighbors", () => {
      const g = new RoleXGraph();
      g.addNode("goal", "goal");
      g.addNode("plan1", "plan");
      g.addNode("plan2", "plan");

      g.relateTo("goal", "plan1", "has-plan");
      g.relateTo("goal", "plan2", "has-plan");

      const out = g.outNeighbors("goal", "has-plan");
      expect(out).toHaveLength(2);
      expect(out).toContain("plan1");
      expect(out).toContain("plan2");

      // plan has no outbound
      expect(g.outNeighbors("plan1")).toEqual([]);
    });

    it("should get inbound neighbors", () => {
      const g = new RoleXGraph();
      g.addNode("goal", "goal");
      g.addNode("plan1", "plan");

      g.relateTo("goal", "plan1", "has-plan");

      const inb = g.inNeighbors("plan1", "has-plan");
      expect(inb).toEqual(["goal"]);
    });

    it("should report size", () => {
      const g = new RoleXGraph();
      g.addNode("a", "persona");
      g.addNode("b", "goal");
      g.relateTo("a", "b", "has-goal");

      expect(g.size()).toBe(1);
    });
  });

  // ===== Shadow =====

  describe("shadow operations", () => {
    it("should shadow a single node without cascade", () => {
      const g = new RoleXGraph();
      g.addNode("goal1", "goal");
      g.addNode("plan1", "plan");
      g.relateTo("goal1", "plan1", "has-plan");

      g.shadow("goal1", false);

      expect(g.getNode("goal1")!.shadow).toBe(true);
      expect(g.getNode("plan1")!.shadow).toBe(false); // not cascaded
    });

    it("should shadow with cascade along directed edges", () => {
      const g = new RoleXGraph();
      g.addNode("goal1", "goal");
      g.addNode("plan1", "plan");
      g.addNode("task1", "task");
      g.addNode("task2", "task");

      g.relateTo("goal1", "plan1", "has-plan");
      g.relateTo("plan1", "task1", "has-task");
      g.relateTo("plan1", "task2", "has-task");

      g.shadow("goal1");

      expect(g.getNode("goal1")!.shadow).toBe(true);
      expect(g.getNode("plan1")!.shadow).toBe(true);
      expect(g.getNode("task1")!.shadow).toBe(true);
      expect(g.getNode("task2")!.shadow).toBe(true);
    });

    it("should not cascade shadow through undirected edges", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");
      g.addNode("org1", "charter");
      g.addNode("goal1", "goal");

      g.relate("org1", "sean", "member"); // undirected
      g.relateTo("sean", "goal1", "has-goal"); // directed

      g.shadow("goal1");

      expect(g.getNode("goal1")!.shadow).toBe(true);
      expect(g.getNode("sean")!.shadow).toBe(false); // not cascaded — undirected
      expect(g.getNode("org1")!.shadow).toBe(false);
    });

    it("should not shadow already-shadowed nodes (no infinite loop)", () => {
      const g = new RoleXGraph();
      g.addNode("a", "goal");
      g.addNode("b", "plan");
      g.relateTo("a", "b", "has-plan");

      // Shadow a, which cascades to b
      g.shadow("a");

      expect(g.getNode("a")!.shadow).toBe(true);
      expect(g.getNode("b")!.shadow).toBe(true);
    });

    it("should restore a shadowed node", () => {
      const g = new RoleXGraph();
      g.addNode("goal1", "goal");
      g.shadow("goal1");

      expect(g.getNode("goal1")!.shadow).toBe(true);

      g.restore("goal1");
      expect(g.getNode("goal1")!.shadow).toBe(false);
    });

    it("should exclude shadowed nodes from order count", () => {
      const g = new RoleXGraph();
      g.addNode("a", "goal");
      g.addNode("b", "goal");
      g.addNode("c", "goal");

      g.shadow("b", false);

      expect(g.order()).toBe(3); // total
      expect(g.order(true)).toBe(2); // excluding shadow
    });

    it("should findNodes excluding shadow", () => {
      const g = new RoleXGraph();
      g.addNode("goal1", "goal");
      g.addNode("goal2", "goal");
      g.shadow("goal2", false);

      const active = g.findNodes((_key, attrs) => attrs.type === "goal" && !attrs.shadow);
      expect(active).toEqual(["goal1"]);
    });
  });

  // ===== Serialization =====

  describe("serialization", () => {
    it("should export and import round-trip", () => {
      const g = new RoleXGraph();
      g.addNode("sean", "persona");
      g.addNode("goal1", "goal");
      g.addNode("plan1", "plan");
      g.addNode("org1", "charter");

      g.relateTo("sean", "goal1", "has-goal");
      g.relateTo("goal1", "plan1", "has-plan");
      g.relate("org1", "sean", "member");

      g.updateNode("sean", { state: { focus: "goal1" } });
      g.shadow("plan1", false);

      const exported = g.export();

      // Import into new graph
      const g2 = new RoleXGraph();
      g2.import(exported);

      expect(g2.order()).toBe(4);
      expect(g2.size()).toBe(3);

      expect(g2.getNode("sean")!.type).toBe("persona");
      expect(g2.getNode("sean")!.state).toEqual({ focus: "goal1" });

      expect(g2.hasEdge("sean", "goal1")).toBe(true);
      expect(g2.hasEdge("goal1", "plan1")).toBe(true);
      expect(g2.hasEdge("org1", "sean")).toBe(true);
      expect(g2.hasEdge("sean", "org1")).toBe(true); // undirected

      expect(g2.getNode("plan1")!.shadow).toBe(true);
    });

    it("should handle empty graph", () => {
      const g = new RoleXGraph();
      const exported = g.export();

      expect(exported.nodes).toEqual([]);
      expect(exported.edges).toEqual([]);

      const g2 = new RoleXGraph();
      g2.import(exported);
      expect(g2.order()).toBe(0);
    });
  });

  // ===== RoleX Lifecycle Scenarios =====

  describe("RoleX lifecycle scenarios", () => {
    it("should model born → want → design → todo → finish → achieve", () => {
      const g = new RoleXGraph();

      // born
      g.addNode("society", "society");
      g.addNode("sean", "persona");
      g.relate("society", "sean", "has-role");

      // want
      g.addNode("build-mvp", "goal");
      g.relateTo("sean", "build-mvp", "has-goal");
      g.updateNode("sean", { state: { focus: "build-mvp" } });

      // design
      g.addNode("mvp-plan", "plan");
      g.relateTo("build-mvp", "mvp-plan", "has-plan");

      // todo
      g.addNode("setup-db", "task");
      g.addNode("write-api", "task");
      g.relateTo("mvp-plan", "setup-db", "has-task");
      g.relateTo("mvp-plan", "write-api", "has-task");

      // verify topology
      expect(g.neighbors("sean", "has-role")).toEqual(["society"]);
      expect(g.outNeighbors("sean", "has-goal")).toEqual(["build-mvp"]);
      expect(g.outNeighbors("build-mvp", "has-plan")).toEqual(["mvp-plan"]);
      expect(g.outNeighbors("mvp-plan", "has-task")).toHaveLength(2);

      // focus state
      expect(g.getNode("sean")!.state.focus).toBe("build-mvp");
    });

    it("should model abandon with cascade shadow", () => {
      const g = new RoleXGraph();

      // Setup: role with goal → plan → tasks
      g.addNode("sean", "persona");
      g.addNode("build-mvp", "goal");
      g.addNode("mvp-plan", "plan");
      g.addNode("task1", "task");
      g.addNode("task2", "task");

      g.relateTo("sean", "build-mvp", "has-goal");
      g.relateTo("build-mvp", "mvp-plan", "has-plan");
      g.relateTo("mvp-plan", "task1", "has-task");
      g.relateTo("mvp-plan", "task2", "has-task");

      // abandon — shadow the goal, cascade to plan and tasks
      g.shadow("build-mvp");

      expect(g.getNode("build-mvp")!.shadow).toBe(true);
      expect(g.getNode("mvp-plan")!.shadow).toBe(true);
      expect(g.getNode("task1")!.shadow).toBe(true);
      expect(g.getNode("task2")!.shadow).toBe(true);

      // sean itself is NOT shadowed — directed edge, not outbound from goal
      expect(g.getNode("sean")!.shadow).toBe(false);

      // Active goals for sean: none (all shadowed)
      const activeGoals = g.outNeighbors("sean", "has-goal")
        .filter(key => !g.getNode(key)!.shadow);
      expect(activeGoals).toEqual([]);
    });

    it("should model hire (org ↔ role bidirectional)", () => {
      const g = new RoleXGraph();

      g.addNode("deepractice", "charter");
      g.addNode("sean", "persona");
      g.addNode("guider", "persona");

      // hire
      g.relate("deepractice", "sean", "member");
      g.relate("deepractice", "guider", "member");

      // org can find its members
      const members = g.neighbors("deepractice", "member");
      expect(members).toHaveLength(2);
      expect(members).toContain("sean");
      expect(members).toContain("guider");

      // role can find its org
      const orgs = g.neighbors("sean", "member");
      expect(orgs).toEqual(["deepractice"]);
    });

    it("should model reflect — shadow insights, create knowledge", () => {
      const g = new RoleXGraph();

      g.addNode("sean", "persona");
      g.addNode("insight1", "experience.insight");
      g.addNode("insight2", "experience.insight");
      g.relateTo("sean", "insight1", "has-insight");
      g.relateTo("sean", "insight2", "has-insight");

      // reflect: create knowledge, shadow insights
      g.addNode("api-design-pattern", "knowledge.pattern");
      g.relateTo("sean", "api-design-pattern", "has-knowledge");

      g.shadow("insight1", false);
      g.shadow("insight2", false);

      // insights are shadowed
      expect(g.getNode("insight1")!.shadow).toBe(true);
      expect(g.getNode("insight2")!.shadow).toBe(true);

      // knowledge is active
      expect(g.getNode("api-design-pattern")!.shadow).toBe(false);

      // active insights: none
      const activeInsights = g.outNeighbors("sean", "has-insight")
        .filter(key => !g.getNode(key)!.shadow);
      expect(activeInsights).toEqual([]);
    });
  });
});
