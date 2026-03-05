import { describe, expect, test } from "bun:test";
import * as C from "@rolexjs/core";
import { createRuntime, type State, type Structure } from "@rolexjs/system";
import { type Commands, createCommands } from "../src/commands.js";

// ================================================================
//  Test setup — pure in-memory, no platform needed
// ================================================================

async function setup() {
  const rt = createRuntime();
  const society = await rt.create(null, C.society);
  const past = await rt.create(society, C.past);

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

  async function find(id: string): Promise<Structure | null> {
    const state = await rt.project(society);
    return findInState(state, id.toLowerCase());
  }

  async function resolve(id: string): Promise<Structure> {
    const node = await find(id);
    if (!node) throw new Error(`"${id}" not found.`);
    return node;
  }

  const commands = createCommands({ rt, society, past, resolve, find });
  return { rt, society, past, commands, find };
}

// ================================================================
//  Individual
// ================================================================

describe("individual", () => {
  test("born creates individual with identity scaffold", async () => {
    const { commands } = await setup();
    const r = await commands["individual.born"]("Feature: Sean", "sean");
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("sean");
    expect(r.state.information).toBe("Feature: Sean");
    expect(r.process).toBe("born");
    const names = r.state.children!.map((c: State) => c.name);
    expect(names).toContain("identity");
  });

  test("born without content creates minimal individual", async () => {
    const { commands } = await setup();
    const r = await commands["individual.born"](undefined, "alice");
    expect(r.state.name).toBe("individual");
    expect(r.state.id).toBe("alice");
  });

  test("born with alias", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"]("Feature: Sean", "sean", ["姜山"]);
    expect(await find("姜山")).not.toBeNull();
  });

  test("born rejects invalid Gherkin", async () => {
    const { commands } = await setup();
    await expect(commands["individual.born"]("not gherkin")).rejects.toThrow("Invalid Gherkin");
  });

  test("born uses distinct identity id", async () => {
    const { commands } = await setup();
    const r = await commands["individual.born"]("Feature: Sean", "sean");
    const identity = r.state.children!.find((c: State) => c.name === "identity");
    expect(identity!.id).toBe("sean-identity");
  });

  test("same id under different parents is allowed", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["position.establish"](undefined, "architect");
    await commands["position.require"]("architect", "Feature: System design", "sys-design");
    await commands["individual.train"]("sean", "Feature: System design skill", "sys-design");

    // Both exist — requirement under position, procedure under individual
    const sean = (await find("sean"))! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(1);
    expect(procs[0].id).toBe("sys-design");
  });

  test("retire archives individual to past", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"]("Feature: Sean", "sean");
    const r = await commands["individual.retire"]("sean");
    expect(r.state.name).toBe("individual");
    expect(r.process).toBe("retire");
    const found = await find("sean");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("individual");
  });

  test("die archives individual", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "alice");
    const r = await commands["individual.die"]("alice");
    expect(r.state.name).toBe("individual");
    expect(r.process).toBe("die");
  });

  test("rehire restores individual from past", async () => {
    const { commands } = await setup();
    await commands["individual.born"]("Feature: Sean", "sean");
    await commands["individual.retire"]("sean");
    const r = await commands["individual.rehire"]("sean");
    expect(r.state.name).toBe("individual");
    expect(r.state.information).toBe("Feature: Sean");
    const names = r.state.children!.map((c: State) => c.name);
    expect(names).toContain("identity");
  });

  test("teach injects principle", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    const r = await commands["individual.teach"](
      "sean",
      "Feature: Always test first",
      "test-first"
    );
    expect(r.state.name).toBe("principle");
    expect(r.state.id).toBe("test-first");
    expect(r.process).toBe("teach");
  });

  test("teach replaces existing principle with same id", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["individual.teach"]("sean", "Feature: Version 1", "rule");
    await commands["individual.teach"]("sean", "Feature: Version 2", "rule");
    const sean = (await find("sean"))!;
    const state = sean as unknown as State;
    const principles = (state.children ?? []).filter((c: State) => c.name === "principle");
    expect(principles).toHaveLength(1);
    expect(principles[0].information).toBe("Feature: Version 2");
  });

  test("train injects procedure", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    const r = await commands["individual.train"](
      "sean",
      "Feature: Code review skill",
      "code-review"
    );
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("code-review");
    expect(r.process).toBe("train");
  });
});

// ================================================================
//  Role: execution
// ================================================================

describe("role: execution", () => {
  test("want creates goal under individual", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    const r = await commands["role.want"]("sean", "Feature: Build auth", "auth");
    expect(r.state.name).toBe("goal");
    expect(r.state.id).toBe("auth");
    expect(r.state.information).toBe("Feature: Build auth");
    expect(r.process).toBe("want");
  });

  test("focus returns goal state", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    const r = await commands["role.focus"]("auth");
    expect(r.state.name).toBe("goal");
    expect(r.state.id).toBe("auth");
    expect(r.process).toBe("focus");
  });

  test("plan creates plan under goal", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    const r = await commands["role.plan"]("auth", "Feature: JWT strategy", "jwt");
    expect(r.state.name).toBe("plan");
    expect(r.state.id).toBe("jwt");
    expect(r.process).toBe("plan");
  });

  test("plan with after creates sequential link", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    await commands["role.plan"]("auth", "Feature: Phase 1", "phase-1");
    await commands["role.plan"]("auth", "Feature: Phase 2", "phase-2", "phase-1");

    const p2 = (await find("phase-2"))! as unknown as State;
    expect(p2.links).toHaveLength(1);
    expect(p2.links![0].relation).toBe("after");
  });

  test("plan with fallback creates alternative link", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    await commands["role.plan"]("auth", "Feature: Plan A", "plan-a");
    await commands["role.plan"]("auth", "Feature: Plan B", "plan-b", undefined, "plan-a");

    const pb = (await find("plan-b"))! as unknown as State;
    expect(pb.links).toHaveLength(1);
    expect(pb.links![0].relation).toBe("fallback-for");
  });

  test("todo creates task under plan", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await commands["role.plan"]("g", undefined, "p");
    const r = await commands["role.todo"]("p", "Feature: Write tests", "t1");
    expect(r.state.name).toBe("task");
    expect(r.state.id).toBe("t1");
    expect(r.process).toBe("todo");
  });

  test("finish tags task done and creates encounter", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await commands["role.plan"]("g", undefined, "p");
    await commands["role.todo"]("p", undefined, "t1");

    const r = await commands["role.finish"](
      "t1",
      "sean",
      "Feature: Task complete\n  Scenario: OK\n    Given done\n    Then ok"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("t1-finished");
    expect(r.process).toBe("finish");
    expect((await find("t1"))!.tag).toBe("done");
  });

  test("finish without encounter just tags task done", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await commands["role.plan"]("g", undefined, "p");
    await commands["role.todo"]("p", undefined, "t1");

    const r = await commands["role.finish"]("t1", "sean");
    expect(r.state.name).toBe("task");
    expect(r.process).toBe("finish");
    expect((await find("t1"))!.tag).toBe("done");
  });

  test("complete tags plan done and creates encounter", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    await commands["role.plan"]("auth", "Feature: JWT", "jwt");

    const r = await commands["role.complete"](
      "jwt",
      "sean",
      "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("jwt-completed");
    expect(r.process).toBe("complete");
    expect((await find("jwt"))!.tag).toBe("done");
  });

  test("abandon tags plan abandoned and creates encounter", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    await commands["role.plan"]("auth", "Feature: JWT", "jwt");

    const r = await commands["role.abandon"](
      "jwt",
      "sean",
      "Feature: Abandoned\n  Scenario: No time\n    Given no time\n    Then abandon"
    );
    expect(r.state.name).toBe("encounter");
    expect(r.state.id).toBe("jwt-abandoned");
    expect(r.process).toBe("abandon");
    expect((await find("jwt"))!.tag).toBe("abandoned");
  });
});

// ================================================================
//  Role: cognition
// ================================================================

describe("role: cognition", () => {
  /** Helper: born → want → plan → todo → finish with encounter. */
  async function withEncounter(commands: Commands) {
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await commands["role.plan"]("g", undefined, "p");
    await commands["role.todo"]("p", undefined, "t1");
    await commands["role.finish"](
      "t1",
      "sean",
      "Feature: Encounter\n  Scenario: OK\n    Given x\n    Then y"
    );
  }

  test("reflect: encounter → experience", async () => {
    const { commands, find } = await setup();
    await withEncounter(commands);
    const r = await commands["role.reflect"](
      "t1-finished",
      "sean",
      "Feature: Insight\n  Scenario: Learned\n    Given x\n    Then y",
      "insight-1"
    );
    expect(r.state.name).toBe("experience");
    expect(r.state.id).toBe("insight-1");
    expect(r.process).toBe("reflect");
    // encounter consumed
    expect(await find("t1-finished")).toBeNull();
  });

  test("reflect without explicit experience uses encounter content", async () => {
    const { commands } = await setup();
    await withEncounter(commands);
    const r = await commands["role.reflect"]("t1-finished", "sean", undefined, "exp-1");
    expect(r.state.name).toBe("experience");
    expect(r.state.information).toContain("Feature: Encounter");
  });

  test("realize: experience → principle", async () => {
    const { commands, find } = await setup();
    await withEncounter(commands);
    await commands["role.reflect"]("t1-finished", "sean", "Feature: Insight", "exp-1");

    const r = await commands["role.realize"](
      "exp-1",
      "sean",
      "Feature: Always validate\n  Scenario: Rule\n    Given validate\n    Then safe",
      "validate-rule"
    );
    expect(r.state.name).toBe("principle");
    expect(r.state.id).toBe("validate-rule");
    expect(r.process).toBe("realize");
    // experience consumed
    expect(await find("exp-1")).toBeNull();
  });

  test("master from experience: experience → procedure", async () => {
    const { commands, find } = await setup();
    await withEncounter(commands);
    await commands["role.reflect"]("t1-finished", "sean", "Feature: Insight", "exp-1");

    const r = await commands["role.master"](
      "sean",
      "Feature: JWT mastery\n  Scenario: Apply\n    Given jwt\n    Then master",
      "jwt-skill",
      "exp-1"
    );
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("jwt-skill");
    expect(r.process).toBe("master");
    // experience consumed
    expect(await find("exp-1")).toBeNull();
  });

  test("master without experience: direct procedure creation", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    const r = await commands["role.master"]("sean", "Feature: Direct skill", "direct-skill");
    expect(r.state.name).toBe("procedure");
    expect(r.state.id).toBe("direct-skill");
  });

  test("master replaces existing procedure with same id", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.master"]("sean", "Feature: V1", "skill");
    await commands["role.master"]("sean", "Feature: V2", "skill");
    const sean = (await find("sean"))! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(1);
    expect(procs[0].information).toBe("Feature: V2");
  });
});

// ================================================================
//  Role: knowledge management
// ================================================================

describe("role: forget", () => {
  test("forget removes a node", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Auth", "auth");
    const r = await commands["role.forget"]("auth");
    expect(r.process).toBe("forget");
    expect(await find("auth")).toBeNull();
  });

  test("forget removes node and its subtree", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await commands["role.plan"]("g", undefined, "p");
    await commands["role.todo"]("p", undefined, "t1");
    await commands["role.forget"]("g");
    expect(await find("g")).toBeNull();
    expect(await find("p")).toBeNull();
    expect(await find("t1")).toBeNull();
  });

  test("forget throws on non-existent node", async () => {
    const { commands } = await setup();
    await expect(commands["role.forget"]("nope")).rejects.toThrow();
  });
});

// ================================================================
//  Organization
// ================================================================

describe("org", () => {
  test("found creates organization", async () => {
    const { commands } = await setup();
    const r = await commands["org.found"]("Feature: Deepractice", "dp");
    expect(r.state.name).toBe("organization");
    expect(r.state.id).toBe("dp");
    expect(r.process).toBe("found");
  });

  test("charter sets org mission", async () => {
    const { commands } = await setup();
    await commands["org.found"](undefined, "dp");
    const r = await commands["org.charter"]("dp", "Feature: Build great AI");
    expect(r.state.name).toBe("charter");
    expect(r.state.information).toBe("Feature: Build great AI");
  });

  test("dissolve archives organization", async () => {
    const { commands, find } = await setup();
    await commands["org.found"](undefined, "dp");
    const r = await commands["org.dissolve"]("dp");
    expect(r.process).toBe("dissolve");
    expect((await find("dp"))!.name).toBe("organization");
  });

  test("hire links individual to org", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["org.found"](undefined, "dp");
    const r = await commands["org.hire"]("dp", "sean");
    expect(r.state.links).toHaveLength(1);
    expect(r.state.links![0].relation).toBe("membership");
  });

  test("fire removes membership", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["org.found"](undefined, "dp");
    await commands["org.hire"]("dp", "sean");
    const r = await commands["org.fire"]("dp", "sean");
    expect(r.state.links).toBeUndefined();
  });
});

// ================================================================
//  Position
// ================================================================

describe("position", () => {
  test("establish creates position", async () => {
    const { commands } = await setup();
    const r = await commands["position.establish"]("Feature: Architect", "architect");
    expect(r.state.name).toBe("position");
    expect(r.state.id).toBe("architect");
    expect(r.process).toBe("establish");
  });

  test("charge adds duty", async () => {
    const { commands } = await setup();
    await commands["position.establish"](undefined, "architect");
    const r = await commands["position.charge"]("architect", "Feature: Design systems", "design");
    expect(r.state.name).toBe("duty");
    expect(r.state.id).toBe("design");
  });

  test("require adds required skill", async () => {
    const { commands } = await setup();
    await commands["position.establish"](undefined, "architect");
    const r = await commands["position.require"](
      "architect",
      "Feature: System design",
      "sys-design"
    );
    expect(r.state.name).toBe("requirement");
    expect(r.state.id).toBe("sys-design");
    expect(r.process).toBe("require");
  });

  test("abolish archives position", async () => {
    const { commands, find } = await setup();
    await commands["position.establish"](undefined, "architect");
    const r = await commands["position.abolish"]("architect");
    expect(r.process).toBe("abolish");
    expect((await find("architect"))!.name).toBe("position");
  });

  test("appoint links individual to position", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["position.establish"](undefined, "architect");
    const r = await commands["position.appoint"]("architect", "sean");
    expect(r.state.links).toHaveLength(1);
    expect(r.state.links![0].relation).toBe("appointment");
  });

  test("appoint auto-trains requirements as procedures", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["position.establish"](undefined, "architect");
    await commands["position.require"]("architect", "Feature: System design", "sys-design");
    await commands["position.require"]("architect", "Feature: Code review", "code-review");
    await commands["position.appoint"]("architect", "sean");

    const sean = (await find("sean"))! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(2);
    expect(procs.map((p: State) => p.id).sort()).toEqual(["code-review", "sys-design"]);
    expect(procs[0].information).toBeDefined();
  });

  test("appoint skips already-trained procedures (idempotent)", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["individual.train"]("sean", "Feature: System design skill", "sys-design");
    await commands["position.establish"](undefined, "architect");
    await commands["position.require"]("architect", "Feature: System design", "sys-design");
    await commands["position.appoint"]("architect", "sean");

    const sean = (await find("sean"))! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    // Only 1: the manually trained one (idempotent, not duplicated)
    expect(procs).toHaveLength(1);
  });

  test("appoint with no requirements creates no procedures", async () => {
    const { commands, find } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["position.establish"](undefined, "architect");
    await commands["position.appoint"]("architect", "sean");

    const sean = (await find("sean"))! as unknown as State;
    const procs = (sean.children ?? []).filter((c: State) => c.name === "procedure");
    expect(procs).toHaveLength(0);
  });

  test("dismiss removes appointment", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["position.establish"](undefined, "architect");
    await commands["position.appoint"]("architect", "sean");
    const r = await commands["position.dismiss"]("architect", "sean");
    expect(r.state.links).toBeUndefined();
  });
});

// ================================================================
//  Census
// ================================================================

describe("census", () => {
  test("list returns CommandResult with individuals and orgs", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["org.found"](undefined, "dp");
    const result = await commands["census.list"]();
    expect(result.process).toBe("list");
    const ids = result.state.children?.map((c) => c.id) ?? [];
    expect(ids).toContain("sean");
    expect(ids).toContain("dp");
  });

  test("list by type filters children", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["org.found"](undefined, "dp");
    const result = await commands["census.list"]("individual");
    const names = result.state.children?.map((c) => c.name) ?? [];
    expect(names.every((n) => n === "individual")).toBe(true);
    const ids = result.state.children?.map((c) => c.id) ?? [];
    expect(ids).toContain("sean");
    expect(ids).not.toContain("dp");
  });

  test("list empty society returns empty children", async () => {
    const { commands } = await setup();
    const result = await commands["census.list"]();
    expect(result.process).toBe("list");
    expect(result.state.children).toEqual([]);
  });

  test("list past entries", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["individual.retire"]("sean");
    const result = await commands["census.list"]("past");
    const ids = result.state.children?.map((c) => c.id) ?? [];
    expect(ids).toContain("sean");
  });
});

// ================================================================
//  Gherkin validation
// ================================================================

describe("gherkin validation", () => {
  test("want rejects invalid Gherkin", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await expect(commands["role.want"]("sean", "not gherkin")).rejects.toThrow("Invalid Gherkin");
  });

  test("plan rejects invalid Gherkin", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", undefined, "g");
    await expect(commands["role.plan"]("g", "not gherkin")).rejects.toThrow("Invalid Gherkin");
  });

  test("operations accept undefined content (optional)", async () => {
    const { commands } = await setup();
    await commands["individual.born"](undefined, "sean");
    await expect(commands["role.want"]("sean", undefined, "g")).resolves.toBeDefined();
    await expect(commands["role.plan"]("g", undefined, "p")).resolves.toBeDefined();
    await expect(commands["role.todo"]("p", undefined, "t")).resolves.toBeDefined();
  });
});

// ================================================================
//  Error handling
// ================================================================

describe("error handling", () => {
  test("resolve throws on non-existent id", async () => {
    const { commands } = await setup();
    await expect(commands["role.focus"]("no-such-goal")).rejects.toThrow(
      '"no-such-goal" not found'
    );
  });

  test("role.skill throws without resourcex", async () => {
    const { commands } = await setup();
    await expect(commands["role.skill"]("some-locator")).rejects.toThrow(
      "ResourceX is not available"
    );
  });
});

// ================================================================
//  Full lifecycle: execution + cognition
// ================================================================

describe("full lifecycle", () => {
  test("born → want → plan → todo → finish → complete → reflect → realize", async () => {
    const { commands, find } = await setup();

    // Setup world
    await commands["individual.born"]("Feature: Sean", "sean");
    await commands["org.found"]("Feature: Deepractice", "dp");
    await commands["position.establish"]("Feature: Architect", "architect");
    await commands["org.charter"]("dp", "Feature: Build great AI");
    await commands["position.charge"]("architect", "Feature: Design systems");
    await commands["org.hire"]("dp", "sean");
    await commands["position.appoint"]("architect", "sean");

    // Execution cycle
    await commands["role.want"]("sean", "Feature: Build auth", "build-auth");
    await commands["role.plan"]("build-auth", "Feature: JWT plan", "jwt-plan");
    await commands["role.todo"]("jwt-plan", "Feature: Login endpoint", "login");
    await commands["role.todo"]("jwt-plan", "Feature: Token refresh", "refresh");

    await commands["role.finish"](
      "login",
      "sean",
      "Feature: Login done\n  Scenario: OK\n    Given login\n    Then done"
    );
    await commands["role.finish"](
      "refresh",
      "sean",
      "Feature: Refresh done\n  Scenario: OK\n    Given refresh\n    Then done"
    );
    await commands["role.complete"](
      "jwt-plan",
      "sean",
      "Feature: Auth plan complete\n  Scenario: OK\n    Given plan\n    Then complete"
    );

    // Verify tags
    expect((await find("login"))!.tag).toBe("done");
    expect((await find("refresh"))!.tag).toBe("done");
    expect((await find("jwt-plan"))!.tag).toBe("done");

    // Cognition cycle
    await commands["role.reflect"](
      "login-finished",
      "sean",
      "Feature: Token insight\n  Scenario: Learned\n    Given token handling\n    Then understand refresh",
      "token-exp"
    );
    expect(await find("login-finished")).toBeNull();

    await commands["role.realize"](
      "token-exp",
      "sean",
      "Feature: Always validate expiry\n  Scenario: Rule\n    Given token\n    Then validate expiry",
      "validate-expiry"
    );
    expect(await find("token-exp")).toBeNull();

    // Verify final state
    const sean = (await find("sean"))! as unknown as State;
    const principle = (sean.children ?? []).find(
      (c: State) => c.name === "principle" && c.id === "validate-expiry"
    );
    expect(principle).toBeDefined();
    expect(principle!.information).toContain("Always validate expiry");
  });

  test("plan → abandon → reflect → master", async () => {
    const { commands, find } = await setup();

    await commands["individual.born"](undefined, "sean");
    await commands["role.want"]("sean", "Feature: Learn Rust", "learn-rust");
    await commands["role.plan"]("learn-rust", "Feature: Book approach", "book-approach");

    await commands["role.abandon"](
      "book-approach",
      "sean",
      "Feature: Too theoretical\n  Scenario: Failed\n    Given reading\n    Then too slow"
    );

    expect((await find("book-approach"))!.tag).toBe("abandoned");

    await commands["role.reflect"](
      "book-approach-abandoned",
      "sean",
      "Feature: Hands-on works better\n  Scenario: Insight\n    Given theory vs practice\n    Then practice wins",
      "hands-on-exp"
    );

    await commands["role.master"](
      "sean",
      "Feature: Learn by doing\n  Scenario: Apply\n    Given new topic\n    Then build a project first",
      "learn-by-doing",
      "hands-on-exp"
    );

    expect(await find("hands-on-exp")).toBeNull();
    const sean = (await find("sean"))! as unknown as State;
    const proc = (sean.children ?? []).find(
      (c: State) => c.name === "procedure" && c.id === "learn-by-doing"
    );
    expect(proc).toBeDefined();
  });
});
