import { describe, expect, test } from "bun:test";
import type { State } from "@rolexjs/system";
import type { CommandResult } from "../../src/commands.js";
import { Role, type RoleDeps, type RoleSnapshot } from "../../src/role-model.js";

// ================================================================
//  Test helpers
// ================================================================

function ok(id: string, name: string, process: string): CommandResult {
  return { state: { id, name }, process };
}

function mockDeps(overrides?: Partial<RoleDeps>): RoleDeps & { saved: RoleSnapshot[] } {
  const saved: RoleSnapshot[] = [];
  return {
    saved,
    commands: {
      "role.focus": async (id: string) => ok(id, "goal", "focus"),
      "role.want": async (_ind: string, _goal?: string, id?: string) =>
        ok(id ?? "g1", "goal", "want"),
      "role.plan": async (_goal: string, _plan?: string, id?: string) =>
        ok(id ?? "p1", "plan", "plan"),
      "role.todo": async (_plan: string, _task?: string, id?: string) =>
        ok(id ?? "t1", "task", "todo"),
      "role.finish": async (task: string, _ind: string, encounter?: string) => {
        if (encounter) return ok(`${task}-finished`, "encounter", "finish");
        return ok(task, "task", "finish");
      },
      "role.complete": async (_plan: string, _ind: string) => ok("enc1", "encounter", "complete"),
      "role.abandon": async (_plan: string, _ind: string) => ok("enc2", "encounter", "abandon"),
      "role.reflect": async (_enc: string | undefined, _ind: string, _exp?: string, id?: string) =>
        ok(id ?? "exp1", "experience", "reflect"),
      "role.realize": async (_exp: string | undefined, _ind: string, _prin?: string, id?: string) =>
        ok(id ?? "prin1", "principle", "realize"),
      "role.master": async (_ind: string, _proc: string, id?: string) =>
        ok(id ?? "proc1", "procedure", "master"),
      "role.forget": async (nodeId: string) => ({
        state: { id: nodeId, name: "task", children: [] },
        process: "forget",
      }),
      "role.skill": async (locator: string) => `skill:${locator}`,
    } as any,
    renderer: {
      render(_command: string, result: CommandResult): string {
        return `[${result.state.name}] (${result.state.id})\n${result.process}`;
      },
    },
    onSave(snapshot: RoleSnapshot) {
      saved.push(snapshot);
    },
    ...overrides,
  };
}

function makeState(id: string, children: State[] = []): State {
  return {
    id,
    name: "individual",
    children,
  };
}

function goalState(id: string, plans: State[] = []): State {
  return { id, name: "goal", children: plans };
}

function planState(id: string, tasks: State[] = []): State {
  return { id, name: "plan", children: tasks };
}

function taskState(id: string): State {
  return { id, name: "task" };
}

function encounterState(id: string): State {
  return { id, name: "encounter" };
}

function experienceState(id: string): State {
  return { id, name: "experience" };
}

// ================================================================
//  Tests
// ================================================================

describe("Role hydration", () => {
  test("hydrate populates nodeIds from state tree", () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);

    role.hydrate(makeState("sean", [goalState("auth", [planState("jwt", [taskState("login")])])]));

    // Indirectly verify via ownership — focus on own goal should work
    // but focus on unknown goal should fail
    // biome-ignore lint/complexity/useLiteralKeys: testing private method
    const check = (id: string, label: string) => role["requireOwnership"](id, label);
    expect(() => check("auth", "Goal")).not.toThrow();
    expect(() => check("jwt", "Plan")).not.toThrow();
    expect(() => check("login", "Task")).not.toThrow();
    expect(() => check("unknown", "Node")).toThrow(/does not belong/);
  });

  test("hydrate sets focusedGoalId to first goal", () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);

    role.hydrate(makeState("sean", [goalState("first-goal"), goalState("second-goal")]));

    const snap = role.snapshot();
    expect(snap.focusedGoalId).toBe("first-goal");
  });

  test("hydrate collects encounters and experiences", () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);

    role.hydrate(
      makeState("sean", [
        encounterState("enc-1"),
        encounterState("enc-2"),
        experienceState("exp-1"),
      ])
    );

    const snap = role.snapshot();
    expect(snap.encounterIds).toEqual(["enc-1", "enc-2"]);
    expect(snap.experienceIds).toEqual(["exp-1"]);
  });
});

describe("Role isolation — ownership validation", () => {
  test("focus rejects goal not owned by this individual", async () => {
    const deps = mockDeps();
    const role = new Role("nuwa", deps);

    role.hydrate(makeState("nuwa", [goalState("setup-cto")]));

    await expect(role.focus("mcp-args")).rejects.toThrow(/does not belong/);
  });

  test("focus without args returns own goal", async () => {
    const deps = mockDeps();
    const role = new Role("nuwa", deps);

    role.hydrate(makeState("nuwa", [goalState("setup-cto")]));

    const result = await role.focus();
    expect(result).toContain("setup-cto");
  });

  test("finish rejects task not owned by this individual", async () => {
    const deps = mockDeps();
    const role = new Role("nuwa", deps);

    role.hydrate(makeState("nuwa", [goalState("g1")]));

    await expect(role.finish("foreign-task")).rejects.toThrow(/does not belong/);
  });

  test("forget rejects node not owned by this individual", async () => {
    const deps = mockDeps();
    const role = new Role("nuwa", deps);

    role.hydrate(makeState("nuwa", [goalState("g1")]));

    await expect(role.forget("foreign-node")).rejects.toThrow(/does not belong/);
  });
});

describe("Role execution lifecycle", () => {
  test("want updates focusedGoalId and adds to nodeIds", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean"));

    await role.want("Feature: Auth", "auth");

    const snap = role.snapshot();
    expect(snap.focusedGoalId).toBe("auth");
    expect(snap.focusedPlanId).toBeNull();
    expect(deps.saved.length).toBeGreaterThan(0);
  });

  test("plan updates focusedPlanId", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth")]));

    await role.plan("Feature: JWT", "jwt");

    expect(role.snapshot().focusedPlanId).toBe("jwt");
  });

  test("todo adds node without saving", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth", [planState("jwt")])]));

    // Set plan focus first via snapshot restore
    role.restore({
      id: "sean",
      focusedGoalId: "auth",
      focusedPlanId: "jwt",
      encounterIds: [],
      experienceIds: [],
    });

    const savedBefore = deps.saved.length;
    await role.todo("Feature: Login", "login");
    expect(deps.saved.length).toBe(savedBefore); // todo doesn't save
  });

  test("finish with encounter registers encounterId", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth", [planState("jwt", [taskState("login")])])]));

    await role.finish("login", "Feature: Done\n  Scenario: OK\n    Given done\n    Then ok");

    const snap = role.snapshot();
    expect(snap.encounterIds).toContain("login-finished");
  });

  test("complete clears focusedPlanId and adds encounter", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth", [planState("jwt")])]));
    role.restore({
      id: "sean",
      focusedGoalId: "auth",
      focusedPlanId: "jwt",
      encounterIds: [],
      experienceIds: [],
    });

    await role.complete("jwt");

    const snap = role.snapshot();
    expect(snap.focusedPlanId).toBeNull();
    expect(snap.encounterIds.length).toBeGreaterThan(0);
  });
});

describe("Role cognition", () => {
  test("reflect consumes encounters and adds experience", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [encounterState("enc-1")]));

    await role.reflect(["enc-1"], "Feature: Insight", "insight-1");

    const snap = role.snapshot();
    expect(snap.encounterIds).not.toContain("enc-1");
    expect(snap.experienceIds).toContain("insight-1");
  });

  test("reflect without encounters creates experience directly", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean"));

    await role.reflect([], "Feature: Direct insight", "direct-1");

    expect(role.snapshot().experienceIds).toContain("direct-1");
  });

  test("reflect rejects unknown encounterIds", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean"));

    await expect(role.reflect(["nonexistent"])).rejects.toThrow(/Encounter not found/);
  });

  test("realize consumes experiences", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [experienceState("exp-1")]));

    await role.realize(["exp-1"], "Feature: Principle", "prin-1");

    const snap = role.snapshot();
    expect(snap.experienceIds).not.toContain("exp-1");
  });

  test("master optionally consumes experiences", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [experienceState("exp-1")]));

    await role.master("Feature: Procedure", "proc-1", ["exp-1"]);

    expect(role.snapshot().experienceIds).not.toContain("exp-1");
  });
});

describe("Role snapshot / restore", () => {
  test("snapshot captures full state", () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(
      makeState("sean", [goalState("auth"), encounterState("enc-1"), experienceState("exp-1")])
    );

    const snap = role.snapshot();
    expect(snap.id).toBe("sean");
    expect(snap.focusedGoalId).toBe("auth");
    expect(snap.encounterIds).toEqual(["enc-1"]);
    expect(snap.experienceIds).toEqual(["exp-1"]);
  });

  test("restore applies snapshot state", () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth")]));

    role.restore({
      id: "sean",
      focusedGoalId: "auth",
      focusedPlanId: "jwt",
      encounterIds: ["enc-1", "enc-2"],
      experienceIds: ["exp-1"],
    });

    const snap = role.snapshot();
    expect(snap.focusedGoalId).toBe("auth");
    expect(snap.focusedPlanId).toBe("jwt");
    expect(snap.encounterIds).toEqual(["enc-1", "enc-2"]);
    expect(snap.experienceIds).toEqual(["exp-1"]);
  });

  test("round-trip: snapshot → restore preserves state", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);
    role.hydrate(makeState("sean", [goalState("auth", [planState("jwt")])]));

    await role.want("Feature: Auth", "auth-2");
    const snap1 = role.snapshot();

    // Create a new role and restore
    const role2 = new Role("sean", mockDeps());
    role2.hydrate(makeState("sean", [goalState("auth"), goalState("auth-2")]));
    role2.restore(snap1);

    const snap2 = role2.snapshot();
    expect(snap2.focusedGoalId).toBe(snap1.focusedGoalId);
    expect(snap2.focusedPlanId).toBe(snap1.focusedPlanId);
  });
});

describe("Role cognitive hints", () => {
  test("activate hint varies by goal state", async () => {
    const deps = mockDeps();
    const role = new Role("sean", deps);

    // No goals
    role.hydrate(makeState("sean"));
    const noGoal = await role.project();
    expect(noGoal).toContain("no goal");

    // With goal
    role.hydrate(makeState("sean", [goalState("auth")]));
    const withGoal = await role.project();
    expect(withGoal).toContain("active goal");
  });
});
