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
      const r = rolex.born("Feature: I am Sean");
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
      const r = rolex.found("Feature: AI company");
      expect(r.state.name).toBe("organization");
      expect(r.process).toBe("found");
    });

    test("establish creates a position under org", () => {
      const rolex = setup();
      const org = rolex.found().state;
      const r = rolex.establish(org, "Feature: Backend architect");
      expect(r.state.name).toBe("position");
    });

    test("charter defines org mission", () => {
      const rolex = setup();
      const org = rolex.found().state;
      const r = rolex.charter(org, "Feature: Build great AI");
      expect(r.state.name).toBe("charter");
      expect(r.state.information).toBe("Feature: Build great AI");
    });

    test("charge adds duty to position", () => {
      const rolex = setup();
      const org = rolex.found().state;
      const pos = rolex.establish(org).state;
      const r = rolex.charge(pos, "Feature: Design systems");
      expect(r.state.name).toBe("duty");
    });
  });

  // ============================================================
  //  Lifecycle — archival
  // ============================================================

  describe("lifecycle: archival", () => {
    test("retire archives individual", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const r = rolex.retire(sean);
      expect(r.state.name).toBe("past");
      expect(r.process).toBe("retire");
      // Original is gone
      expect(() => rolex.project(sean)).toThrow();
    });

    test("die archives individual", () => {
      const rolex = setup();
      const alice = rolex.born().state;
      const r = rolex.die(alice);
      expect(r.state.name).toBe("past");
      expect(r.process).toBe("die");
    });

    test("dissolve archives organization", () => {
      const rolex = setup();
      const org = rolex.found().state;
      rolex.dissolve(org);
      expect(() => rolex.project(org)).toThrow();
    });

    test("abolish archives position", () => {
      const rolex = setup();
      const org = rolex.found().state;
      const pos = rolex.establish(org).state;
      rolex.abolish(pos);
      expect(() => rolex.project(pos)).toThrow();
    });

    test("rehire restores individual from past", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const archived = rolex.retire(sean).state;
      const r = rolex.rehire(archived);
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
      const sean = rolex.born().state;
      const org = rolex.found().state;
      const r = rolex.hire(org, sean);
      expect(r.state.links).toHaveLength(1);
      expect(r.state.links![0].relation).toBe("membership");
    });

    test("fire removes membership", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const org = rolex.found().state;
      rolex.hire(org, sean);
      const r = rolex.fire(org, sean);
      expect(r.state.links).toBeUndefined();
    });

    test("appoint links individual to position", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const org = rolex.found().state;
      const pos = rolex.establish(org).state;
      const r = rolex.appoint(pos, sean);
      expect(r.state.links).toHaveLength(1);
      expect(r.state.links![0].relation).toBe("appointment");
    });

    test("dismiss removes appointment", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const org = rolex.found().state;
      const pos = rolex.establish(org).state;
      rolex.appoint(pos, sean);
      const r = rolex.dismiss(pos, sean);
      expect(r.state.links).toBeUndefined();
    });
  });

  // ============================================================
  //  Role
  // ============================================================

  describe("role", () => {
    test("activate returns individual projection", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const r = rolex.activate(sean);
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
      const sean = rolex.born().state;
      const r = rolex.want(sean, "Feature: Build auth system");
      expect(r.state.name).toBe("goal");
      expect(r.state.information).toBe("Feature: Build auth system");
    });

    test("plan creates a plan under goal", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const r = rolex.plan(goal, "Feature: JWT plan");
      expect(r.state.name).toBe("plan");
    });

    test("todo creates a task under plan", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const r = rolex.todo(plan, "Feature: Implement JWT");
      expect(r.state.name).toBe("task");
    });

    test("finish consumes task, creates encounter", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan).state;

      const r = rolex.finish(task, sean, "Feature: JWT done");
      expect(r.state.name).toBe("encounter");
      expect(r.state.information).toBe("Feature: JWT done");
      // Task is gone
      expect(() => rolex.project(task)).toThrow();
    });

    test("complete consumes plan, creates encounter", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const plan = rolex.plan(goal, "Feature: Auth plan").state;

      const r = rolex.complete(plan, sean, "Feature: Auth plan done");
      expect(r.state.name).toBe("encounter");
      expect(() => rolex.project(plan)).toThrow();
    });

    test("abandon consumes plan, creates encounter", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Rust").state;
      const plan = rolex.plan(goal, "Feature: Rust plan").state;

      const r = rolex.abandon(plan, sean, "Feature: No time");
      expect(r.state.name).toBe("encounter");
      expect(() => rolex.project(plan)).toThrow();
    });
  });

  // ============================================================
  //  Cognition
  // ============================================================

  describe("cognition", () => {
    test("reflect: encounter → experience", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan).state;
      const enc = rolex.finish(task, sean, "Feature: JWT quirks").state;

      const r = rolex.reflect(enc, sean, "Feature: Token refresh matters");
      expect(r.state.name).toBe("experience");
      expect(r.state.information).toBe("Feature: Token refresh matters");
      expect(() => rolex.project(enc)).toThrow();
    });

    test("reflect inherits encounter info if no source given", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan).state;
      const enc = rolex.finish(task, sean, "Feature: JWT quirks").state;

      const r = rolex.reflect(enc, sean);
      expect(r.state.information).toBe("Feature: JWT quirks");
    });

    test("realize: experience → principle under knowledge", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const knowledge = sean.children!.find((c) => c.name === "knowledge")!;

      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan).state;
      const enc = rolex.finish(task, sean, "Feature: Lessons").state;
      const exp = rolex.reflect(enc, sean).state;

      const r = rolex.realize(exp, knowledge, "Feature: Security first");
      expect(r.state.name).toBe("principle");
      expect(r.state.information).toBe("Feature: Security first");
      expect(() => rolex.project(exp)).toThrow();
    });

    test("master: experience → skill under knowledge", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const knowledge = sean.children!.find((c) => c.name === "knowledge")!;

      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan).state;
      const enc = rolex.finish(task, sean, "Feature: Practice").state;
      const exp = rolex.reflect(enc, sean).state;

      const r = rolex.master(exp, knowledge, "Feature: JWT mastery");
      expect(r.state.name).toBe("skill");
    });
  });

  // ============================================================
  //  Full scenario
  // ============================================================

  describe("full scenario", () => {
    test("born → hire → appoint → want → plan → todo → finish → reflect → realize", () => {
      const rolex = setup();

      // Create world
      const sean = rolex.born("Feature: I am Sean").state;
      const org = rolex.found("Feature: Deepractice").state;
      const pos = rolex.establish(org, "Feature: Architect").state;
      rolex.charter(org, "Feature: Build great AI");
      rolex.charge(pos, "Feature: Design systems");

      // Organization
      rolex.hire(org, sean);
      rolex.appoint(pos, sean);

      // Verify links
      const orgState = rolex.project(org);
      expect(orgState.links).toHaveLength(1);
      const posState = orgState.children!.find((c) => c.name === "position")!;
      expect(posState.links).toHaveLength(1);

      // Execution cycle
      const goal = rolex.want(sean, "Feature: Build auth").state;
      const plan = rolex.plan(goal, "Feature: JWT auth plan").state;
      const t1 = rolex.todo(plan, "Feature: Login endpoint").state;
      const t2 = rolex.todo(plan, "Feature: Refresh endpoint").state;

      const enc1 = rolex.finish(t1, sean, "Feature: Login done").state;
      const _enc2 = rolex.finish(t2, sean, "Feature: Refresh done").state;
      rolex.complete(plan, sean, "Feature: Auth plan complete");

      // Cognition cycle
      const knowledge = sean.children!.find((c) => c.name === "knowledge")!;
      const exp = rolex.reflect(enc1, sean, "Feature: Token handling").state;
      rolex.realize(exp, knowledge, "Feature: Always validate expiry");

      // Verify knowledge
      const knowledgeState = rolex.project(knowledge);
      expect(knowledgeState.children).toHaveLength(1);
      expect(knowledgeState.children![0].name).toBe("principle");
      expect(knowledgeState.children![0].information).toBe("Feature: Always validate expiry");
    });
  });

  // ============================================================
  //  Render
  // ============================================================

  describe("render", () => {
    test("describe generates text with name", () => {
      const rolex = setup();
      const r = rolex.born();
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
      const r = rolex.born("Feature: I am Sean\n  An AI role.");
      const md = renderState(r.state);
      expect(md).toContain("# [individual]");
      expect(md).toContain("Feature: I am Sean");
      expect(md).toContain("An AI role.");
    });

    test("renders children at deeper heading levels", () => {
      const rolex = setup();
      const r = rolex.born("Feature: Sean");
      const md = renderState(r.state);
      // identity and knowledge are children at depth 2
      expect(md).toContain("## [identity]");
      expect(md).toContain("## [knowledge]");
    });

    test("renders links generically", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const org = rolex.found("Feature: Deepractice").state;
      rolex.hire(org, sean);
      // Project org — should have membership link
      const orgState = rolex.project(org);
      const md = renderState(orgState);
      expect(md).toContain("membership");
      expect(md).toContain("[individual]");
    });

    test("renders bidirectional links", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const org = rolex.found("Feature: Deepractice").state;
      rolex.hire(org, sean);
      // Project individual — should have belong link
      const seanState = rolex.project(sean);
      const md = renderState(seanState);
      expect(md).toContain("belong");
      expect(md).toContain("[organization]");
      expect(md).toContain("Deepractice");
    });

    test("renders nested structure (goal → plan → task)", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Build auth").state;
      const plan = rolex.plan(goal, "Feature: JWT plan").state;
      rolex.todo(plan, "Feature: Login endpoint");
      // Project goal to see full tree
      const goalState = rolex.project(goal);
      const md = renderState(goalState);
      expect(md).toContain("# [goal]");
      expect(md).toContain("## [plan]");
      expect(md).toContain("### [task]");
      expect(md).toContain("Feature: Build auth");
      expect(md).toContain("Feature: JWT plan");
      expect(md).toContain("Feature: Login endpoint");
    });

    test("caps heading depth at 6", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      // individual(1) → identity(2) is the deepest built-in nesting
      // Manually test with depth parameter
      const md = renderState(sean, 7);
      // Should use ###### (6) not ####### (7)
      expect(md).toStartWith("###### [individual]");
    });

    test("renders without information gracefully", () => {
      const rolex = setup();
      const r = rolex.born();
      const identity = r.state.children!.find((c) => c.name === "identity")!;
      const md = renderState(identity);
      expect(md).toBe("# [identity]");
    });
  });

  // ============================================================
  //  Gherkin validation
  // ============================================================

  describe("gherkin validation", () => {
    test("born rejects non-Gherkin input", () => {
      const rolex = setup();
      expect(() => rolex.born("not gherkin")).toThrow("Invalid Gherkin");
    });

    test("born accepts valid Gherkin", () => {
      const rolex = setup();
      expect(() => rolex.born("Feature: Sean")).not.toThrow();
    });

    test("born accepts undefined (no source)", () => {
      const rolex = setup();
      expect(() => rolex.born()).not.toThrow();
    });

    test("want rejects non-Gherkin goal", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      expect(() => rolex.want(sean, "plain text goal")).toThrow("Invalid Gherkin");
    });

    test("finish rejects non-Gherkin encounter", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan, "Feature: Login").state;
      expect(() => rolex.finish(task, sean, "just text")).toThrow("Invalid Gherkin");
    });

    test("reflect rejects non-Gherkin experience", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan, "Feature: Login").state;
      const enc = rolex.finish(
        task,
        sean,
        "Feature: Done\n  Scenario: It worked\n    Given login\n    Then success"
      ).state;
      expect(() => rolex.reflect(enc, sean, "not gherkin")).toThrow("Invalid Gherkin");
    });

    test("realize rejects non-Gherkin principle", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const knowledge = sean.children!.find((c) => c.name === "knowledge")!;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan, "Feature: Login").state;
      const enc = rolex.finish(
        task,
        sean,
        "Feature: Done\n  Scenario: OK\n    Given x\n    Then y"
      ).state;
      const exp = rolex.reflect(
        enc,
        sean,
        "Feature: Insight\n  Scenario: Learned\n    Given practice\n    Then understanding"
      ).state;
      expect(() => rolex.realize(exp, knowledge, "not gherkin")).toThrow("Invalid Gherkin");
    });

    test("master rejects non-Gherkin skill", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const knowledge = sean.children!.find((c) => c.name === "knowledge")!;
      const goal = rolex.want(sean, "Feature: Auth").state;
      const plan = rolex.plan(goal).state;
      const task = rolex.todo(plan, "Feature: Login").state;
      const enc = rolex.finish(
        task,
        sean,
        "Feature: Done\n  Scenario: OK\n    Given x\n    Then y"
      ).state;
      const exp = rolex.reflect(
        enc,
        sean,
        "Feature: Insight\n  Scenario: Learned\n    Given practice\n    Then understanding"
      ).state;
      expect(() => rolex.master(exp, knowledge, "not gherkin")).toThrow("Invalid Gherkin");
    });
  });

  // ============================================================
  //  id & alias
  // ============================================================

  describe("id & alias", () => {
    test("born with id stores it on the node", () => {
      const rolex = setup();
      const r = rolex.born("Feature: I am Sean", "sean");
      expect(r.state.id).toBe("sean");
      expect(r.state.ref).toBeDefined();
    });

    test("born with id and alias stores both", () => {
      const rolex = setup();
      const r = rolex.born("Feature: I am Sean", "sean", ["Sean", "姜山"]);
      expect(r.state.id).toBe("sean");
      expect(r.state.alias).toEqual(["Sean", "姜山"]);
    });

    test("born without id has no id field", () => {
      const rolex = setup();
      const r = rolex.born("Feature: I am Sean");
      expect(r.state.id).toBeUndefined();
    });

    test("want with id stores it on the goal", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const r = rolex.want(sean, "Feature: Build auth", "build-auth");
      expect(r.state.id).toBe("build-auth");
    });

    test("todo with id stores it on the task", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean").state;
      const goal = rolex.want(sean).state;
      const plan = rolex.plan(goal).state;
      const r = rolex.todo(plan, "Feature: Login", "impl-login");
      expect(r.state.id).toBe("impl-login");
    });

    test("find by id", () => {
      const rolex = setup();
      rolex.born("Feature: I am Sean", "sean");
      const found = rolex.find("sean");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("individual");
      expect(found!.id).toBe("sean");
    });

    test("find by alias", () => {
      const rolex = setup();
      rolex.born("Feature: I am Sean", "sean", ["Sean", "姜山"]);
      const found = rolex.find("姜山");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("individual");
    });

    test("find is case insensitive", () => {
      const rolex = setup();
      rolex.born("Feature: I am Sean", "sean", ["Sean"]);
      expect(rolex.find("Sean")).not.toBeNull();
      expect(rolex.find("SEAN")).not.toBeNull();
      expect(rolex.find("sean")).not.toBeNull();
    });

    test("find returns null when not found", () => {
      const rolex = setup();
      rolex.born("Feature: I am Sean", "sean");
      expect(rolex.find("nobody")).toBeNull();
    });

    test("find searches nested nodes", () => {
      const rolex = setup();
      const sean = rolex.born("Feature: Sean", "sean").state;
      rolex.want(sean, "Feature: Build auth", "build-auth");
      const found = rolex.find("build-auth");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("goal");
    });

    test("found with id", () => {
      const rolex = setup();
      const r = rolex.found("Feature: Deepractice", "deepractice");
      expect(r.state.id).toBe("deepractice");
    });

    test("establish with id", () => {
      const rolex = setup();
      const org = rolex.found("Feature: Deepractice").state;
      const r = rolex.establish(org, "Feature: Architect", "architect");
      expect(r.state.id).toBe("architect");
    });
  });
});
