import { describe, expect, test } from "bun:test";
import { localPlatform } from "@rolexjs/local-platform";
import { describe as renderDescribe, hint as renderHint, renderState } from "../src/render.js";
import { createRoleX } from "../src/rolex.js";

function setup() {
  return createRoleX(localPlatform({ dataDir: null }));
}

describe("Rolex API (stateless)", () => {
  // ============================================================
  //  Lifecycle — creation
  // ============================================================

  describe("lifecycle: creation", () => {
    test("born creates an individual with scaffolding", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: I am Sean", "sean");
      expect(r.state.name).toBe("individual");
      expect(r.state.information).toBe("Feature: I am Sean");
      expect(r.process).toBe("born");
      // Scaffolding: identity + knowledge
      const names = r.state.children!.map((c) => c.name);
      expect(names).toContain("identity");
      expect(names).toContain("knowledge");
    });

    test("found creates an organization", () => {
      const rolex = setup();
      const r = rolex.org.found("Feature: AI company", "ai-co");
      expect(r.state.name).toBe("organization");
      expect(r.process).toBe("found");
    });

    test("establish creates a position under org", () => {
      const rolex = setup();
      rolex.org.found(undefined, "org1");
      const r = rolex.org.establish("org1", "Feature: Backend architect", "pos1");
      expect(r.state.name).toBe("position");
    });

    test("charter defines org mission", () => {
      const rolex = setup();
      rolex.org.found(undefined, "org1");
      const r = rolex.org.charter("org1", "Feature: Build great AI");
      expect(r.state.name).toBe("charter");
      expect(r.state.information).toBe("Feature: Build great AI");
    });

    test("charge adds duty to position", () => {
      const rolex = setup();
      rolex.org.found(undefined, "org1");
      rolex.org.establish("org1", undefined, "pos1");
      const r = rolex.org.charge("pos1", "Feature: Design systems");
      expect(r.state.name).toBe("duty");
    });
  });

  // ============================================================
  //  Lifecycle — archival
  // ============================================================

  describe("lifecycle: archival", () => {
    test("retire archives individual", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      const r = rolex.individual.retire("sean");
      expect(r.state.name).toBe("past");
      expect(r.process).toBe("retire");
      // Original individual is gone — only past node with same id remains
      const found = rolex.find("sean");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("past");
    });

    test("die archives individual", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "alice");
      const r = rolex.individual.die("alice");
      expect(r.state.name).toBe("past");
      expect(r.process).toBe("die");
    });

    test("dissolve archives organization", () => {
      const rolex = setup();
      rolex.org.found(undefined, "org1");
      rolex.org.dissolve("org1");
      const found = rolex.find("org1");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("past");
    });

    test("abolish archives position", () => {
      const rolex = setup();
      rolex.org.found(undefined, "org1");
      rolex.org.establish("org1", undefined, "pos1");
      rolex.org.abolish("pos1");
      const found = rolex.find("pos1");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("past");
    });

    test("rehire restores individual from past", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.individual.retire("sean");
      const r = rolex.individual.rehire("sean");
      expect(r.state.name).toBe("individual");
      expect(r.state.information).toBe("Feature: Sean");
      // Scaffolding restored
      const names = r.state.children!.map((c) => c.name);
      expect(names).toContain("identity");
      expect(names).toContain("knowledge");
    });
  });

  // ============================================================
  //  Organization
  // ============================================================

  describe("organization", () => {
    test("hire links individual to org", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.org.found(undefined, "org1");
      const r = rolex.org.hire("org1", "sean");
      expect(r.state.links).toHaveLength(1);
      expect(r.state.links![0].relation).toBe("membership");
    });

    test("fire removes membership", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.org.found(undefined, "org1");
      rolex.org.hire("org1", "sean");
      const r = rolex.org.fire("org1", "sean");
      expect(r.state.links).toBeUndefined();
    });

    test("appoint links individual to position", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.org.found(undefined, "org1");
      rolex.org.establish("org1", undefined, "pos1");
      const r = rolex.org.appoint("pos1", "sean");
      expect(r.state.links).toHaveLength(1);
      expect(r.state.links![0].relation).toBe("appointment");
    });

    test("dismiss removes appointment", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.org.found(undefined, "org1");
      rolex.org.establish("org1", undefined, "pos1");
      rolex.org.appoint("pos1", "sean");
      const r = rolex.org.dismiss("pos1", "sean");
      expect(r.state.links).toBeUndefined();
    });
  });

  // ============================================================
  //  Role
  // ============================================================

  describe("role", () => {
    test("activate returns individual projection", async () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      const r = await rolex.role.activate("sean");
      expect(r.state.name).toBe("individual");
      expect(r.process).toBe("activate");
    });
  });

  // ============================================================
  //  Execution
  // ============================================================

  describe("execution", () => {
    test("want creates a goal", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      const r = rolex.role.want("sean", "Feature: Build auth system", "g1");
      expect(r.state.name).toBe("goal");
      expect(r.state.information).toBe("Feature: Build auth system");
    });

    test("plan creates a plan under goal", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", "Feature: Auth", "g1");
      const r = rolex.role.plan("g1", "Feature: JWT plan", "p1");
      expect(r.state.name).toBe("plan");
    });

    test("todo creates a task under plan", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      const r = rolex.role.todo("p1", "Feature: Implement JWT", "t1");
      expect(r.state.name).toBe("task");
    });

    test("finish consumes task, creates encounter", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", undefined, "t1");

      const r = rolex.role.finish("t1", "sean", "Feature: JWT done");
      expect(r.state.name).toBe("encounter");
      expect(r.state.information).toBe("Feature: JWT done");
      // Task is gone
      expect(rolex.find("t1")).toBeNull();
    });

    test("complete consumes plan, creates encounter", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", "Feature: Auth", "g1");
      rolex.role.plan("g1", "Feature: Auth plan", "p1");

      const r = rolex.role.complete("p1", "sean", "Feature: Auth plan done");
      expect(r.state.name).toBe("encounter");
      expect(rolex.find("p1")).toBeNull();
    });

    test("abandon consumes plan, creates encounter", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", "Feature: Rust", "g1");
      rolex.role.plan("g1", "Feature: Rust plan", "p1");

      const r = rolex.role.abandon("p1", "sean", "Feature: No time");
      expect(r.state.name).toBe("encounter");
      expect(rolex.find("p1")).toBeNull();
    });
  });

  // ============================================================
  //  Cognition
  // ============================================================

  describe("cognition", () => {
    test("reflect: encounter → experience", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", undefined, "t1");
      rolex.role.finish("t1", "sean", "Feature: JWT quirks");

      const r = rolex.role.reflect("t1-finished", "sean", "Feature: Token refresh matters", "exp1");
      expect(r.state.name).toBe("experience");
      expect(r.state.information).toBe("Feature: Token refresh matters");
      expect(rolex.find("t1-finished")).toBeNull();
    });

    test("reflect inherits encounter info if no source given", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", undefined, "t1");
      rolex.role.finish("t1", "sean", "Feature: JWT quirks");

      const r = rolex.role.reflect("t1-finished", "sean");
      expect(r.state.information).toBe("Feature: JWT quirks");
    });

    test("realize: experience → principle under individual", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", undefined, "t1");
      rolex.role.finish("t1", "sean", "Feature: Lessons");
      rolex.role.reflect("t1-finished", "sean", undefined, "exp1");

      const r = rolex.role.realize("exp1", "sean", "Feature: Security first", "sec-first");
      expect(r.state.name).toBe("principle");
      expect(r.state.information).toBe("Feature: Security first");
      expect(rolex.find("exp1")).toBeNull();
    });

    test("master: experience → procedure under individual", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", undefined, "t1");
      rolex.role.finish("t1", "sean", "Feature: Practice");
      rolex.role.reflect("t1-finished", "sean", undefined, "exp1");

      const r = rolex.role.master("sean", "Feature: JWT mastery", "jwt", "exp1");
      expect(r.state.name).toBe("procedure");
    });
  });

  // ============================================================
  //  Full scenario
  // ============================================================

  describe("full scenario", () => {
    test("born → hire → appoint → want → plan → todo → finish → reflect → realize", () => {
      const rolex = setup();

      // Create world
      rolex.individual.born("Feature: I am Sean", "sean");
      rolex.org.found("Feature: Deepractice", "dp");
      rolex.org.establish("dp", "Feature: Architect", "architect");
      rolex.org.charter("dp", "Feature: Build great AI");
      rolex.org.charge("architect", "Feature: Design systems");

      // Organization
      rolex.org.hire("dp", "sean");
      rolex.org.appoint("architect", "sean");

      // Verify links
      const orgState = rolex.find("dp")!;
      expect(orgState.links).toHaveLength(1);
      const posState = (orgState as any).children!.find((c: any) => c.name === "position")!;
      expect(posState.links).toHaveLength(1);

      // Execution cycle
      rolex.role.want("sean", "Feature: Build auth", "build-auth");
      rolex.role.plan("build-auth", "Feature: JWT auth plan", "jwt-plan");
      rolex.role.todo("jwt-plan", "Feature: Login endpoint", "t1");
      rolex.role.todo("jwt-plan", "Feature: Refresh endpoint", "t2");

      rolex.role.finish("t1", "sean", "Feature: Login done");
      rolex.role.finish("t2", "sean", "Feature: Refresh done");
      rolex.role.complete("jwt-plan", "sean", "Feature: Auth plan complete");

      // Cognition cycle
      rolex.role.reflect("t1-finished", "sean", "Feature: Token handling", "token-exp");
      rolex.role.realize("token-exp", "sean", "Feature: Always validate expiry", "validate-expiry");

      // Verify principle exists under individual
      const seanState = rolex.find("sean")!;
      const principle = (seanState as any).children?.find((c: any) => c.name === "principle");
      expect(principle).toBeDefined();
      expect(principle.information).toBe("Feature: Always validate expiry");
    });
  });

  // ============================================================
  //  Render
  // ============================================================

  describe("render", () => {
    test("describe generates text with name", () => {
      const rolex = setup();
      const r = rolex.individual.born(undefined, "sean");
      const text = renderDescribe("born", "sean", r.state);
      expect(text).toContain("sean");
    });

    test("hint generates next step", () => {
      const h = renderHint("born");
      expect(h).toStartWith("Next:");
    });

    test("every process has a hint", () => {
      const processes = [
        "born",
        "found",
        "establish",
        "charter",
        "charge",
        "retire",
        "die",
        "dissolve",
        "abolish",
        "rehire",
        "hire",
        "fire",
        "appoint",
        "dismiss",
        "activate",
        "want",
        "plan",
        "todo",
        "finish",
        "complete",
        "abandon",
        "reflect",
        "realize",
        "master",
      ];
      for (const p of processes) {
        expect(renderHint(p)).toStartWith("Next:");
      }
    });
  });

  // ============================================================
  //  renderState — generic markdown renderer
  // ============================================================

  describe("renderState", () => {
    test("renders individual with heading and information", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: I am Sean\n  An AI role.", "sean");
      const md = renderState(r.state);
      expect(md).toContain("# [individual]");
      expect(md).toContain("Feature: I am Sean");
      expect(md).toContain("An AI role.");
    });

    test("renders children at deeper heading levels", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: Sean", "sean");
      const md = renderState(r.state);
      // identity and knowledge are children at depth 2
      expect(md).toContain("## [identity]");
      expect(md).toContain("## [knowledge]");
    });

    test("renders links generically", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.org.found("Feature: Deepractice", "dp");
      rolex.org.hire("dp", "sean");
      // Project org — should have membership link
      const orgState = rolex.find("dp")!;
      const md = renderState(orgState as any);
      expect(md).toContain("membership");
      expect(md).toContain("[individual]");
    });

    test("renders bidirectional links", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.org.found("Feature: Deepractice", "dp");
      rolex.org.hire("dp", "sean");
      // Project individual — should have belong link
      const seanState = rolex.find("sean")!;
      const md = renderState(seanState as any);
      expect(md).toContain("belong");
      expect(md).toContain("[organization]");
      expect(md).toContain("Deepractice");
    });

    test("renders nested structure (goal → plan → task)", () => {
      const rolex = setup();
      rolex.individual.born(undefined, "sean");
      rolex.role.want("sean", "Feature: Build auth", "g1");
      rolex.role.plan("g1", "Feature: JWT plan", "p1");
      rolex.role.todo("p1", "Feature: Login endpoint", "t1");
      // Project goal to see full tree
      const goalState = rolex.find("g1")!;
      const md = renderState(goalState as any);
      expect(md).toContain("# [goal]");
      expect(md).toContain("## [plan]");
      expect(md).toContain("### [task]");
      expect(md).toContain("Feature: Build auth");
      expect(md).toContain("Feature: JWT plan");
      expect(md).toContain("Feature: Login endpoint");
    });

    test("caps heading depth at 6", () => {
      const rolex = setup();
      const r = rolex.individual.born(undefined, "sean");
      // Manually test with depth parameter
      const md = renderState(r.state, 7);
      // Should use ###### (6) not ####### (7)
      expect(md).toStartWith("###### [individual]");
    });

    test("renders without information gracefully", () => {
      const rolex = setup();
      const r = rolex.individual.born(undefined, "sean");
      const identity = r.state.children!.find((c) => c.name === "identity")!;
      const md = renderState(identity as any);
      expect(md).toBe("# [identity]");
    });
  });

  // ============================================================
  //  Gherkin validation
  // ============================================================

  describe("gherkin validation", () => {
    test("born rejects non-Gherkin input", () => {
      const rolex = setup();
      expect(() => rolex.individual.born("not gherkin")).toThrow("Invalid Gherkin");
    });

    test("born accepts valid Gherkin", () => {
      const rolex = setup();
      expect(() => rolex.individual.born("Feature: Sean")).not.toThrow();
    });

    test("born accepts undefined (no source)", () => {
      const rolex = setup();
      expect(() => rolex.individual.born()).not.toThrow();
    });

    test("want rejects non-Gherkin goal", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      expect(() => rolex.role.want("sean", "plain text goal")).toThrow("Invalid Gherkin");
    });

    test("finish rejects non-Gherkin encounter", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.role.want("sean", "Feature: Auth", "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", "Feature: Login", "t1");
      expect(() => rolex.role.finish("t1", "sean", "just text")).toThrow("Invalid Gherkin");
    });

    test("reflect rejects non-Gherkin experience", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.role.want("sean", "Feature: Auth", "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", "Feature: Login", "t1");
      rolex.role.finish(
        "t1",
        "sean",
        "Feature: Done\n  Scenario: It worked\n    Given login\n    Then success"
      );
      expect(() => rolex.role.reflect("t1-finished", "sean", "not gherkin")).toThrow(
        "Invalid Gherkin"
      );
    });

    test("realize rejects non-Gherkin principle", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.role.want("sean", "Feature: Auth", "g1");
      rolex.role.plan("g1", undefined, "p1");
      rolex.role.todo("p1", "Feature: Login", "t1");
      rolex.role.finish("t1", "sean", "Feature: Done\n  Scenario: OK\n    Given x\n    Then y");
      rolex.role.reflect(
        "t1-finished",
        "sean",
        "Feature: Insight\n  Scenario: Learned\n    Given practice\n    Then understanding",
        "exp1"
      );
      expect(() => rolex.role.realize("exp1", "sean", "not gherkin")).toThrow("Invalid Gherkin");
    });

    test("master rejects non-Gherkin procedure", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      expect(() => rolex.role.master("sean", "not gherkin")).toThrow("Invalid Gherkin");
    });
  });

  // ============================================================
  //  id & alias
  // ============================================================

  describe("id & alias", () => {
    test("born with id stores it on the node", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: I am Sean", "sean");
      expect(r.state.id).toBe("sean");
      expect(r.state.ref).toBeDefined();
    });

    test("born with id and alias stores both", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: I am Sean", "sean", ["Sean", "姜山"]);
      expect(r.state.id).toBe("sean");
      expect(r.state.alias).toEqual(["Sean", "姜山"]);
    });

    test("born without id has no id field", () => {
      const rolex = setup();
      const r = rolex.individual.born("Feature: I am Sean");
      expect(r.state.id).toBeUndefined();
    });

    test("want with id stores it on the goal", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      const r = rolex.role.want("sean", "Feature: Build auth", "build-auth");
      expect(r.state.id).toBe("build-auth");
    });

    test("todo with id stores it on the task", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.role.want("sean", undefined, "g1");
      rolex.role.plan("g1", undefined, "p1");
      const r = rolex.role.todo("p1", "Feature: Login", "impl-login");
      expect(r.state.id).toBe("impl-login");
    });

    test("find by id", () => {
      const rolex = setup();
      rolex.individual.born("Feature: I am Sean", "sean");
      const found = rolex.find("sean");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("individual");
      expect(found!.id).toBe("sean");
    });

    test("find by alias", () => {
      const rolex = setup();
      rolex.individual.born("Feature: I am Sean", "sean", ["Sean", "姜山"]);
      const found = rolex.find("姜山");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("individual");
    });

    test("find is case insensitive", () => {
      const rolex = setup();
      rolex.individual.born("Feature: I am Sean", "sean", ["Sean"]);
      expect(rolex.find("Sean")).not.toBeNull();
      expect(rolex.find("SEAN")).not.toBeNull();
      expect(rolex.find("sean")).not.toBeNull();
    });

    test("find returns null when not found", () => {
      const rolex = setup();
      rolex.individual.born("Feature: I am Sean", "sean");
      expect(rolex.find("nobody")).toBeNull();
    });

    test("find searches nested nodes", () => {
      const rolex = setup();
      rolex.individual.born("Feature: Sean", "sean");
      rolex.role.want("sean", "Feature: Build auth", "build-auth");
      const found = rolex.find("build-auth");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("goal");
    });

    test("found with id", () => {
      const rolex = setup();
      const r = rolex.org.found("Feature: Deepractice", "deepractice");
      expect(r.state.id).toBe("deepractice");
    });

    test("establish with id", () => {
      const rolex = setup();
      rolex.org.found("Feature: Deepractice", "dp");
      const r = rolex.org.establish("dp", "Feature: Architect", "architect");
      expect(r.state.id).toBe("architect");
    });
  });
});
