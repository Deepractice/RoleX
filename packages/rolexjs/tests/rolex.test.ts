import { describe, test, expect } from "bun:test";
import { createGraphRuntime } from "@rolexjs/local-platform";
import { Rolex } from "../src/rolex.js";
import {
  describe as renderDescribe,
  hint as renderHint,
} from "../src/render.js";

function setup() {
  return new Rolex({ runtime: createGraphRuntime() });
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

    test("achieve consumes goal, creates encounter", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Auth").state;

      const r = rolex.achieve(goal, sean, "Feature: Auth done");
      expect(r.state.name).toBe("encounter");
      expect(() => rolex.project(goal)).toThrow();
    });

    test("abandon consumes goal, creates encounter", () => {
      const rolex = setup();
      const sean = rolex.born().state;
      const goal = rolex.want(sean, "Feature: Rust").state;

      const r = rolex.abandon(goal, sean, "Feature: No time");
      expect(r.state.name).toBe("encounter");
      expect(() => rolex.project(goal)).toThrow();
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
      const enc2 = rolex.finish(t2, sean, "Feature: Refresh done").state;
      rolex.achieve(goal, sean, "Feature: Auth complete");

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
        "born", "found", "establish", "charter", "charge",
        "retire", "die", "dissolve", "abolish", "rehire",
        "hire", "fire", "appoint", "dismiss",
        "activate",
        "want", "plan", "todo", "finish", "achieve", "abandon",
        "reflect", "realize", "master",
      ];
      for (const p of processes) {
        expect(renderHint(p)).toStartWith("Next:");
      }
    });
  });
});
