import { describe, expect, test } from "bun:test";
import * as C from "@rolexjs/core";
import { createRuntime, type State, type Structure } from "@rolexjs/system";
import { createOps, type Ops } from "../src/ops.js";

// ================================================================
//  Test setup — pure in-memory, no platform needed
// ================================================================

function setup() {
  const rt = createRuntime();
  const society = rt.create(null, C.society);
  const past = rt.create(society, C.past);

  function findInState(state: State, target: string): Structure | null {
    if (state.id?.toLowerCase() === target) return state;
    if (state.alias) {
      for (const a of state.alias) {
        if (a.toLowerCase() === target) return state;
      }
    }
    for (const child of state.children ?? []) {
      const found = findInState(child, target);
      if (found) return found;
    }
    return null;
  }

  function find(id: string): Structure | null {
    const state = rt.project(society);
    return findInState(state, id.toLowerCase());
  }

  function resolve(id: string): Structure {
    const node = find(id);
    if (!node) throw new Error(`"${id}" not found.`);
    return node;
  }

  const ops = createOps({ rt, society, past, resolve, find });
  return { rt, society, past, ops, find };
}

// ================================================================
//  Individual
// ================================================================

describe("individual", () => {
  test("born creates individual with identity scaffold", () => {
    const { ops } = setup();
    const r = ops["individual.born"]("Feature: Sean", "sean");
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("sean");
    expect(r.state.information).toBe("Feature: Sean");
    expect(r.process).toBe("born");
    const names = r.state.children!.map((c: State) => c.name);
    expect(names).toContain("identity");
  });

  test("born without content creates minimal individual", () => {
    const { ops } = setup();
    const r = ops["individual.born"](undefined, "alice");
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("alice");
  });

  test("born with alias", () => {
    const { ops, find } = setup();
    ops["individual.born"]("Feature: Sean", "sean", ["姜山"]);
    expect(find("姜山")).not.toBeNull();
  });

  test("born rejects invalid Gherkin", () => {
    const { ops } = setup();
    expect(() => ops["individual.born"]("not gherkin")).toThrow("Invalid Gherkin");
  });

  test("born uses distinct identity id", () => {
    const { ops } = setup();
    const r = ops["individual.born"]("Feature: Sean", "sean");
    const identity = r.state.children!.find((c: State) => c.name === "identity");
    expect(identity!.id).toBe("sean-identity");
  });

  test("duplicate id across tree throws", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["org.found"](undefined, "acme");
    expect(() => ops["org.charter"]("acme", "Feature: Charter", "sean")).toThrow(
      'Duplicate id "sean"'
    );
  });

  test("retire archives individual to past", () => {
    const { ops, find } = setup();
    ops["individual.born"]("Feature: Sean", "sean");
    const r = ops["individual.retire"]("sean");
    expect(r.state.name).toBe("past");
    expect(r.process).toBe("retire");
    const found = find("sean");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("past");
  });

  test("die archives individual", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "alice");
    const r = ops["individual.die"]("alice");
    expect(r.state.name).toBe("past");
    expect(r.process).toBe("die");
  });

  test("rehire restores individual from past", () => {
    const { ops } = setup();
    ops["individual.born"]("Feature: Sean", "sean");
    ops["individual.retire"]("sean");
    const r = ops["individual.rehire"]("sean");
    expect(r.state.name).toBe("individual");
    expect(r.state.information).toBe("Feature: Sean");
    const names = r.state.children!.map((c: State) => c.name);
    expect(names).toContain("identity");
  });

  test("teach injects principle", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    const r = ops["individual.teach"]("sean", "Feature: Always test first", "test-first");
    expect(r.state.name).toBe("principle");
    expect(r.state.id).toBe("test-first");
    expect(r.process).toBe("teach");
  });

  test("teach replaces existing principle with same id", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["individual.teach"]("sean", "Feature: Version 1", "rule");
    ops["individual.teach"]("sean", "Feature: Version 2", "rule");
    const sean = find("sean")!;
    const state = sean as unknown as State;
    const principles = (state.children ?? []).filter((c: State) => c.name === "principle");
    expect(principles).toHaveLength(1);
    expect(principles[0].information).toBe("Feature: Version 2");
  });

  test("train injects procedure", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    const r = ops["individual.train"]("sean", "Feature: Code review skill", "code-review");
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("code-review");
    expect(r.process).toBe("train");
  });
});

// ================================================================
//  Role: execution
// ================================================================

describe("role: execution", () => {
  test("want creates goal under individual", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    const r = ops["role.want"]("sean", "Feature: Build auth", "auth");
    expect(r.state.name).toBe("goal");
    expect(r.state.id).toBe("auth");
    expect(r.state.information).toBe("Feature: Build auth");
    expect(r.process).toBe("want");
  });

  test("focus returns goal state", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    const r = ops["role.focus"]("auth");
    expect(r.state.name).toBe("goal");
    expect(r.state.id).toBe("auth");
    expect(r.process).toBe("focus");
  });

  test("plan creates plan under goal", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    const r = ops["role.plan"]("auth", "Feature: JWT strategy", "jwt");
    expect(r.state.name).toBe("plan");
    expect(r.state.id).toBe("jwt");
    expect(r.process).toBe("plan");
  });

  test("plan with after creates sequential link", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    ops["role.plan"]("auth", "Feature: Phase 1", "phase-1");
    ops["role.plan"]("auth", "Feature: Phase 2", "phase-2", "phase-1");

    const p2 = find("phase-2")! as unknown as State;
    expect(p2.links).toHaveLength(1);
    expect(p2.links![0].relation).toBe("after");
  });

  test("plan with fallback creates alternative link", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    ops["role.plan"]("auth", "Feature: Plan A", "plan-a");
    ops["role.plan"]("auth", "Feature: Plan B", "plan-b", undefined, "plan-a");

    const pb = find("plan-b")! as unknown as State;
    expect(pb.links).toHaveLength(1);
    expect(pb.links![0].relation).toBe("fallback-for");
  });

  test("todo creates task under plan", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    ops["role.plan"]("g", undefined, "p");
    const r = ops["role.todo"]("p", "Feature: Write tests", "t1");
    expect(r.state.name).toBe("task");
    expect(r.state.id).toBe("t1");
    expect(r.process).toBe("todo");
  });

  test("finish tags task done and creates encounter", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    ops["role.plan"]("g", undefined, "p");
    ops["role.todo"]("p", undefined, "t1");

    const r = ops["role.finish"](
      "t1",
      "sean",
      "Feature: Task complete\n  Scenario: OK\n    Given done\n    Then ok"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("t1-finished");
    expect(r.process).toBe("finish");
    expect(find("t1")!.tag).toBe("done");
  });

  test("finish without encounter just tags task done", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    ops["role.plan"]("g", undefined, "p");
    ops["role.todo"]("p", undefined, "t1");

    const r = ops["role.finish"]("t1", "sean");
    expect(r.state.name).toBe("task");
    expect(r.process).toBe("finish");
    expect(find("t1")!.tag).toBe("done");
  });

  test("complete tags plan done and creates encounter", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    ops["role.plan"]("auth", "Feature: JWT", "jwt");

    const r = ops["role.complete"](
      "jwt",
      "sean",
      "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("jwt-completed");
    expect(r.process).toBe("complete");
    expect(find("jwt")!.tag).toBe("done");
  });

  test("abandon tags plan abandoned and creates encounter", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    ops["role.plan"]("auth", "Feature: JWT", "jwt");

    const r = ops["role.abandon"](
      "jwt",
      "sean",
      "Feature: Abandoned\n  Scenario: No time\n    Given no time\n    Then abandon"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("jwt-abandoned");
    expect(r.process).toBe("abandon");
    expect(find("jwt")!.tag).toBe("abandoned");
  });
});

// ================================================================
//  Role: cognition
// ================================================================

describe("role: cognition", () => {
  /** Helper: born → want → plan → todo → finish with encounter. */
  function withEncounter(ops: Ops) {
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    ops["role.plan"]("g", undefined, "p");
    ops["role.todo"]("p", undefined, "t1");
    ops["role.finish"]("t1", "sean", "Feature: Encounter\n  Scenario: OK\n    Given x\n    Then y");
  }

  test("reflect: encounter → experience", () => {
    const { ops, find } = setup();
    withEncounter(ops);
    const r = ops["role.reflect"](
      "t1-finished",
      "sean",
      "Feature: Insight\n  Scenario: Learned\n    Given x\n    Then y",
      "insight-1"
    );
    expect(r.state.name).toBe("experience");
    expect(r.state.id).toBe("insight-1");
    expect(r.process).toBe("reflect");
    // encounter consumed
    expect(find("t1-finished")).toBeNull();
  });

  test("reflect without explicit experience uses encounter content", () => {
    const { ops } = setup();
    withEncounter(ops);
    const r = ops["role.reflect"]("t1-finished", "sean", undefined, "exp-1");
    expect(r.state.name).toBe("experience");
    expect(r.state.information).toContain("Feature: Encounter");
  });

  test("realize: experience → principle", () => {
    const { ops, find } = setup();
    withEncounter(ops);
    ops["role.reflect"]("t1-finished", "sean", "Feature: Insight", "exp-1");

    const r = ops["role.realize"](
      "exp-1",
      "sean",
      "Feature: Always validate\n  Scenario: Rule\n    Given validate\n    Then safe",
      "validate-rule"
    );
    expect(r.state.name).toBe("principle");
    expect(r.state.id).toBe("validate-rule");
    expect(r.process).toBe("realize");
    // experience consumed
    expect(find("exp-1")).toBeNull();
  });

  test("master from experience: experience → procedure", () => {
    const { ops, find } = setup();
    withEncounter(ops);
    ops["role.reflect"]("t1-finished", "sean", "Feature: Insight", "exp-1");

    const r = ops["role.master"](
      "sean",
      "Feature: JWT mastery\n  Scenario: Apply\n    Given jwt\n    Then master",
      "jwt-skill",
      "exp-1"
    );
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("jwt-skill");
    expect(r.process).toBe("master");
    // experience consumed
    expect(find("exp-1")).toBeNull();
  });

  test("master without experience: direct procedure creation", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    const r = ops["role.master"]("sean", "Feature: Direct skill", "direct-skill");
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("direct-skill");
  });

  test("master replaces existing procedure with same id", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.master"]("sean", "Feature: V1", "skill");
    ops["role.master"]("sean", "Feature: V2", "skill");
    const sean = find("sean")! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(1);
    expect(procs[0].information).toBe("Feature: V2");
  });
});

// ================================================================
//  Role: knowledge management
// ================================================================

describe("role: forget", () => {
  test("forget removes a node", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Auth", "auth");
    const r = ops["role.forget"]("auth");
    expect(r.process).toBe("forget");
    expect(find("auth")).toBeNull();
  });

  test("forget removes node and its subtree", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    ops["role.plan"]("g", undefined, "p");
    ops["role.todo"]("p", undefined, "t1");
    ops["role.forget"]("g");
    expect(find("g")).toBeNull();
    expect(find("p")).toBeNull();
    expect(find("t1")).toBeNull();
  });

  test("forget throws on non-existent node", () => {
    const { ops } = setup();
    expect(() => ops["role.forget"]("nope")).toThrow();
  });
});

// ================================================================
//  Organization
// ================================================================

describe("org", () => {
  test("found creates organization", () => {
    const { ops } = setup();
    const r = ops["org.found"]("Feature: Deepractice", "dp");
    expect(r.state.name).toBe("organization");
    expect(r.state.id).toBe("dp");
    expect(r.process).toBe("found");
  });

  test("charter sets org mission", () => {
    const { ops } = setup();
    ops["org.found"](undefined, "dp");
    const r = ops["org.charter"]("dp", "Feature: Build great AI");
    expect(r.state.name).toBe("charter");
    expect(r.state.information).toBe("Feature: Build great AI");
  });

  test("dissolve archives organization", () => {
    const { ops, find } = setup();
    ops["org.found"](undefined, "dp");
    const r = ops["org.dissolve"]("dp");
    expect(r.process).toBe("dissolve");
    expect(find("dp")!.name).toBe("past");
  });

  test("hire links individual to org", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["org.found"](undefined, "dp");
    const r = ops["org.hire"]("dp", "sean");
    expect(r.state.links).toHaveLength(1);
    expect(r.state.links![0].relation).toBe("membership");
  });

  test("fire removes membership", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["org.found"](undefined, "dp");
    ops["org.hire"]("dp", "sean");
    const r = ops["org.fire"]("dp", "sean");
    expect(r.state.links).toBeUndefined();
  });
});

// ================================================================
//  Position
// ================================================================

describe("position", () => {
  test("establish creates position", () => {
    const { ops } = setup();
    const r = ops["position.establish"]("Feature: Architect", "architect");
    expect(r.state.name).toBe("position");
    expect(r.state.id).toBe("architect");
    expect(r.process).toBe("establish");
  });

  test("charge adds duty", () => {
    const { ops } = setup();
    ops["position.establish"](undefined, "architect");
    const r = ops["position.charge"]("architect", "Feature: Design systems", "design");
    expect(r.state.name).toBe("duty");
    expect(r.state.id).toBe("design");
  });

  test("require adds required skill", () => {
    const { ops } = setup();
    ops["position.establish"](undefined, "architect");
    const r = ops["position.require"]("architect", "Feature: System design", "sys-design");
    expect(r.state.name).toBe("requirement");
    expect(r.state.id).toBe("sys-design");
    expect(r.process).toBe("require");
  });

  test("abolish archives position", () => {
    const { ops, find } = setup();
    ops["position.establish"](undefined, "architect");
    const r = ops["position.abolish"]("architect");
    expect(r.process).toBe("abolish");
    expect(find("architect")!.name).toBe("past");
  });

  test("appoint links individual to position", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["position.establish"](undefined, "architect");
    const r = ops["position.appoint"]("architect", "sean");
    expect(r.state.links).toHaveLength(1);
    expect(r.state.links![0].relation).toBe("appointment");
  });

  test("appoint does not copy requirements as procedures", () => {
    const { ops, find } = setup();
    ops["individual.born"](undefined, "sean");
    ops["position.establish"](undefined, "architect");
    ops["position.require"]("architect", "Feature: System design", "sys-design");
    ops["position.require"]("architect", "Feature: Code review", "code-review");
    ops["position.appoint"]("architect", "sean");

    const sean = find("sean")! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(0);
  });

  test("dismiss removes appointment", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["position.establish"](undefined, "architect");
    ops["position.appoint"]("architect", "sean");
    const r = ops["position.dismiss"]("architect", "sean");
    expect(r.state.links).toBeUndefined();
  });
});

// ================================================================
//  Census
// ================================================================

describe("census", () => {
  test("list shows individuals and orgs", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["org.found"](undefined, "dp");
    const result = ops["census.list"]();
    expect(result).toContain("sean");
    expect(result).toContain("dp");
  });

  test("list by type filters", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["org.found"](undefined, "dp");
    const result = ops["census.list"]("individual");
    expect(result).toContain("sean");
    expect(result).not.toContain("dp");
  });

  test("list empty society", () => {
    const { ops } = setup();
    const result = ops["census.list"]();
    expect(result).toBe("Society is empty.");
  });

  test("list past entries", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["individual.retire"]("sean");
    const result = ops["census.list"]("past");
    expect(result).toContain("sean");
  });
});

// ================================================================
//  Gherkin validation
// ================================================================

describe("gherkin validation", () => {
  test("want rejects invalid Gherkin", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    expect(() => ops["role.want"]("sean", "not gherkin")).toThrow("Invalid Gherkin");
  });

  test("plan rejects invalid Gherkin", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", undefined, "g");
    expect(() => ops["role.plan"]("g", "not gherkin")).toThrow("Invalid Gherkin");
  });

  test("operations accept undefined content (optional)", () => {
    const { ops } = setup();
    ops["individual.born"](undefined, "sean");
    expect(() => ops["role.want"]("sean", undefined, "g")).not.toThrow();
    expect(() => ops["role.plan"]("g", undefined, "p")).not.toThrow();
    expect(() => ops["role.todo"]("p", undefined, "t")).not.toThrow();
  });
});

// ================================================================
//  Error handling
// ================================================================

describe("error handling", () => {
  test("resolve throws on non-existent id", () => {
    const { ops } = setup();
    expect(() => ops["role.focus"]("no-such-goal")).toThrow('"no-such-goal" not found');
  });

  test("role.skill throws without resourcex", () => {
    const { ops } = setup();
    expect(() => ops["role.skill"]("some-locator")).toThrow("ResourceX is not available");
  });
});

// ================================================================
//  Full lifecycle: execution + cognition
// ================================================================

describe("full lifecycle", () => {
  test("born → want → plan → todo → finish → complete → reflect → realize", () => {
    const { ops, find } = setup();

    // Setup world
    ops["individual.born"]("Feature: Sean", "sean");
    ops["org.found"]("Feature: Deepractice", "dp");
    ops["position.establish"]("Feature: Architect", "architect");
    ops["org.charter"]("dp", "Feature: Build great AI");
    ops["position.charge"]("architect", "Feature: Design systems");
    ops["org.hire"]("dp", "sean");
    ops["position.appoint"]("architect", "sean");

    // Execution cycle
    ops["role.want"]("sean", "Feature: Build auth", "build-auth");
    ops["role.plan"]("build-auth", "Feature: JWT plan", "jwt-plan");
    ops["role.todo"]("jwt-plan", "Feature: Login endpoint", "login");
    ops["role.todo"]("jwt-plan", "Feature: Token refresh", "refresh");

    ops["role.finish"](
      "login",
      "sean",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then done"
    );
    ops["role.finish"](
      "refresh",
      "sean",
      "Feature: Refresh done\n  Scenario: OK\n    Given refresh\n    Then done"
    );
    ops["role.complete"](
      "jwt-plan",
      "sean",
      "Feature: Auth plan complete\n  Scenario: OK\n    Given plan\n    Then complete"
    );

    // Verify tags
    expect(find("login")!.tag).toBe("done");
    expect(find("refresh")!.tag).toBe("done");
    expect(find("jwt-plan")!.tag).toBe("done");

    // Cognition cycle
    ops["role.reflect"](
      "login-finished",
      "sean",
      "Feature: Token insight\n  Scenario: Learned\n    Given token handling\n    Then understand refresh",
      "token-exp"
    );
    expect(find("login-finished")).toBeNull();

    ops["role.realize"](
      "token-exp",
      "sean",
      "Feature: Always validate expiry\n  Scenario: Rule\n    Given token\n    Then validate expiry",
      "validate-expiry"
    );
    expect(find("token-exp")).toBeNull();

    // Verify final state
    const sean = find("sean")! as unknown as State;
    const principle = (sean.children ?? []).find(
      (c: State) => c.name === "principle" && c.id === "validate-expiry"
    );
    expect(principle).toBeDefined();
    expect(principle!.information).toContain("Always validate expiry");
  });

  test("plan → abandon → reflect → master", () => {
    const { ops, find } = setup();

    ops["individual.born"](undefined, "sean");
    ops["role.want"]("sean", "Feature: Learn Rust", "learn-rust");
    ops["role.plan"]("learn-rust", "Feature: Book approach", "book-approach");

    ops["role.abandon"](
      "book-approach",
      "sean",
      "Feature: Too theoretical\n  Scenario: Failed\n    Given reading\n    Then too slow"
    );

    expect(find("book-approach")!.tag).toBe("abandoned");

    ops["role.reflect"](
      "book-approach-abandoned",
      "sean",
      "Feature: Hands-on works better\n  Scenario: Insight\n    Given theory vs practice\n    Then practice wins",
      "hands-on-exp"
    );

    ops["role.master"](
      "sean",
      "Feature: Learn by doing\n  Scenario: Apply\n    Given new topic\n    Then build a project first",
      "learn-by-doing",
      "hands-on-exp"
    );

    expect(find("hands-on-exp")).toBeNull();
    const sean = find("sean")! as unknown as State;
    const proc = (sean.children ?? []).find(
      (c: State) => c.name === "procedure" && c.id === "learn-by-doing"
    );
    expect(proc).toBeDefined();
  });
});
