import { describe, expect, test } from "bun:test";
import type { State } from "@rolexjs/system";
import { filesToState, stateToFiles } from "../src/manifest.js";

// Helper to create minimal State nodes
const state = (
  name: string,
  opts?: {
    id?: string;
    information?: string;
    children?: State[];
    links?: State["links"];
    alias?: readonly string[];
  }
): State => ({
  name,
  description: "",
  parent: null,
  ...(opts?.id ? { id: opts.id } : {}),
  ...(opts?.information ? { information: opts.information } : {}),
  ...(opts?.children ? { children: opts.children } : {}),
  ...(opts?.links ? { links: opts.links } : {}),
  ...(opts?.alias ? { alias: opts.alias } : {}),
});

// ================================================================
//  stateToFiles
// ================================================================

describe("stateToFiles", () => {
  test("simple individual with no children", () => {
    const s = state("individual", {
      id: "nuwa",
      information: "Feature: Nuwa\n  The first role.",
    });
    const { manifest, files } = stateToFiles(s);

    expect(manifest.id).toBe("nuwa");
    expect(manifest.type).toBe("individual");
    expect(manifest.children).toBeUndefined();

    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("nuwa.individual.feature");
    expect(files[0].content).toBe("Feature: Nuwa\n  The first role.");
  });

  test("individual with identity and knowledge children", () => {
    const s = state("individual", {
      id: "nuwa",
      information: "Feature: Nuwa",
      children: [
        state("identity", { information: "Feature: Persona" }),
        state("knowledge", {
          children: [
            state("principle", {
              id: "role-creation",
              information: "Feature: Role Creation Rule",
            }),
            state("procedure", {
              id: "orchestration",
              information: "Feature: Orchestration Procedure",
            }),
          ],
        }),
      ],
    });
    const { manifest, files } = stateToFiles(s);

    // manifest structure
    expect(manifest.id).toBe("nuwa");
    expect(manifest.children?.identity).toEqual({ type: "identity" });
    expect(manifest.children?.knowledge?.children?.["role-creation"]).toEqual({
      type: "principle",
    });
    expect(manifest.children?.knowledge?.children?.orchestration).toEqual({
      type: "procedure",
    });

    // files
    expect(files).toHaveLength(4); // nuwa, identity, role-creation, orchestration
    const paths = files.map((f) => f.path);
    expect(paths).toContain("nuwa.individual.feature");
    expect(paths).toContain("identity.identity.feature");
    expect(paths).toContain("role-creation.principle.feature");
    expect(paths).toContain("orchestration.procedure.feature");
  });

  test("nodes without information produce no file", () => {
    const s = state("individual", {
      id: "nuwa",
      children: [state("knowledge")], // no information
    });
    const { manifest, files } = stateToFiles(s);

    expect(files).toHaveLength(0); // no files — neither nuwa nor knowledge have information
    expect(manifest.children?.knowledge).toEqual({ type: "knowledge" });
  });

  test("node without id defaults to type name", () => {
    const s = state("individual", {
      id: "nuwa",
      children: [state("identity", { information: "Feature: Identity info" })],
    });
    const { manifest, files } = stateToFiles(s);

    // identity has no id, defaults to "identity"
    expect(manifest.children?.identity).toBeDefined();
    expect(files[0].path).toBe("identity.identity.feature");
  });

  test("alias is preserved in manifest", () => {
    const s = state("individual", {
      id: "nuwa",
      alias: ["女娲", "Nuwa"],
      information: "Feature: Nuwa",
    });
    const { manifest } = stateToFiles(s);

    expect(manifest.alias).toEqual(["女娲", "Nuwa"]);
  });

  test("links are serialized", () => {
    const target = state("organization", { id: "deepractice" });
    const s = state("individual", {
      id: "nuwa",
      links: [{ relation: "belong", target }],
    });
    const { manifest } = stateToFiles(s);

    expect(manifest.links).toEqual({ belong: ["deepractice"] });
  });

  test("child node links are serialized", () => {
    const plan1 = state("plan", { id: "phase-1", information: "Feature: Phase 1" });
    const plan2 = state("plan", {
      id: "phase-2",
      information: "Feature: Phase 2",
      links: [{ relation: "after", target: state("plan", { id: "phase-1" }) }],
    });
    const s = state("individual", {
      id: "sean",
      children: [
        state("goal", {
          id: "g1",
          information: "Feature: Goal",
          children: [plan1, plan2],
        }),
      ],
    });
    const { manifest } = stateToFiles(s);

    const goalNode = manifest.children?.g1;
    expect(goalNode?.children?.["phase-1"]?.links).toBeUndefined();
    expect(goalNode?.children?.["phase-2"]?.links).toEqual({ after: ["phase-1"] });
  });

  test("multiple links of same relation", () => {
    const org1 = state("organization", { id: "dp" });
    const org2 = state("organization", { id: "acme" });
    const s = state("individual", {
      id: "nuwa",
      links: [
        { relation: "belong", target: org1 },
        { relation: "belong", target: org2 },
      ],
    });
    const { manifest } = stateToFiles(s);

    expect(manifest.links?.belong).toEqual(["dp", "acme"]);
  });

  test("deep nesting: goal > plan > task", () => {
    const s = state("individual", {
      id: "sean",
      children: [
        state("goal", {
          id: "build-auth",
          information: "Feature: Build auth",
          children: [
            state("plan", {
              id: "plan-1",
              information: "Feature: Auth plan",
              children: [
                state("task", {
                  id: "implement-jwt",
                  information: "Feature: Implement JWT",
                }),
              ],
            }),
          ],
        }),
      ],
    });
    const { manifest, files } = stateToFiles(s);

    // manifest nesting
    const goalNode = manifest.children?.["build-auth"];
    expect(goalNode?.type).toBe("goal");
    const planNode = goalNode?.children?.["plan-1"];
    expect(planNode?.type).toBe("plan");
    const taskNode = planNode?.children?.["implement-jwt"];
    expect(taskNode?.type).toBe("task");

    // files are flat
    const paths = files.map((f) => f.path);
    expect(paths).toContain("build-auth.goal.feature");
    expect(paths).toContain("plan-1.plan.feature");
    expect(paths).toContain("implement-jwt.task.feature");
  });
});

// ================================================================
//  filesToState
// ================================================================

describe("filesToState", () => {
  test("simple individual", () => {
    const manifest = { id: "nuwa", type: "individual" };
    const files = { "nuwa.individual.feature": "Feature: Nuwa\n  The first role." };

    const s = filesToState(manifest, files);
    expect(s.id).toBe("nuwa");
    expect(s.name).toBe("individual");
    expect(s.information).toBe("Feature: Nuwa\n  The first role.");
  });

  test("individual with children", () => {
    const manifest = {
      id: "nuwa",
      type: "individual",
      children: {
        identity: { type: "identity" },
        knowledge: {
          type: "knowledge",
          children: {
            "role-creation": { type: "principle" },
          },
        },
      },
    };
    const files = {
      "nuwa.individual.feature": "Feature: Nuwa",
      "identity.identity.feature": "Feature: Persona",
      "role-creation.principle.feature": "Feature: Role Creation",
    };

    const s = filesToState(manifest, files);
    expect(s.children).toHaveLength(2);

    const identity = s.children!.find((c) => c.name === "identity");
    expect(identity?.id).toBe("identity");
    expect(identity?.information).toBe("Feature: Persona");

    const knowledge = s.children!.find((c) => c.name === "knowledge");
    expect(knowledge?.children).toHaveLength(1);
    expect(knowledge?.children?.[0].id).toBe("role-creation");
    expect(knowledge?.children?.[0].name).toBe("principle");
    expect(knowledge?.children?.[0].information).toBe("Feature: Role Creation");
  });

  test("missing feature file results in no information", () => {
    const manifest = {
      id: "nuwa",
      type: "individual",
      children: {
        knowledge: { type: "knowledge" },
      },
    };
    const files = {};

    const s = filesToState(manifest, files);
    expect(s.information).toBeUndefined();
    expect(s.children![0].information).toBeUndefined();
  });

  test("alias is preserved", () => {
    const manifest = {
      id: "nuwa",
      type: "individual",
      alias: ["女娲", "Nuwa"] as readonly string[],
    };
    const s = filesToState(manifest, {});
    expect(s.alias).toEqual(["女娲", "Nuwa"]);
  });

  test("links are deserialized", () => {
    const manifest = {
      id: "nuwa",
      type: "individual",
      links: { belong: ["deepractice"] },
    };
    const s = filesToState(manifest, {});
    expect(s.links).toHaveLength(1);
    expect(s.links![0].relation).toBe("belong");
    expect(s.links![0].target.id).toBe("deepractice");
  });

  test("child node links are deserialized", () => {
    const manifest = {
      id: "sean",
      type: "individual",
      children: {
        g1: {
          type: "goal",
          children: {
            "phase-1": { type: "plan" },
            "phase-2": { type: "plan", links: { after: ["phase-1"] } },
          },
        },
      },
    };
    const s = filesToState(manifest, {});
    const goal = s.children![0];
    const phase2 = goal.children!.find((c) => c.id === "phase-2")!;
    expect(phase2.links).toHaveLength(1);
    expect(phase2.links![0].relation).toBe("after");
    expect(phase2.links![0].target.id).toBe("phase-1");
  });
});

// ================================================================
//  Round-trip
// ================================================================

describe("round-trip", () => {
  test("stateToFiles → filesToState preserves structure", () => {
    const original = state("individual", {
      id: "sean",
      alias: ["Sean", "姜山"],
      information: "Feature: Sean",
      children: [
        state("identity", { information: "Feature: Backend architect" }),
        state("knowledge", {
          information: "Feature: What I know",
          children: [
            state("principle", { id: "naming", information: "Feature: Name params well" }),
            state("procedure", { id: "platform", information: "Feature: Platform seam" }),
          ],
        }),
        state("encounter", { id: "enc-1", information: "Feature: Did something" }),
      ],
    });

    const { manifest, files } = stateToFiles(original);
    const fileContents: Record<string, string> = {};
    for (const f of files) {
      fileContents[f.path] = f.content;
    }

    const restored = filesToState(manifest, fileContents);

    // Root
    expect(restored.id).toBe("sean");
    expect(restored.name).toBe("individual");
    expect(restored.alias).toEqual(["Sean", "姜山"]);
    expect(restored.information).toBe("Feature: Sean");

    // Children
    expect(restored.children).toHaveLength(3);
    const identity = restored.children!.find((c) => c.name === "identity");
    expect(identity?.information).toBe("Feature: Backend architect");

    const knowledge = restored.children!.find((c) => c.name === "knowledge");
    expect(knowledge?.information).toBe("Feature: What I know");
    expect(knowledge?.children).toHaveLength(2);

    const naming = knowledge?.children?.find((c) => c.id === "naming");
    expect(naming?.name).toBe("principle");
    expect(naming?.information).toBe("Feature: Name params well");
  });

  test("child node links survive round-trip", () => {
    const original = state("individual", {
      id: "sean",
      children: [
        state("goal", {
          id: "g1",
          information: "Feature: Goal",
          children: [
            state("plan", {
              id: "phase-1",
              information: "Feature: Phase 1",
              links: [{ relation: "before", target: state("plan", { id: "phase-2" }) }],
            }),
            state("plan", {
              id: "phase-2",
              information: "Feature: Phase 2",
              links: [{ relation: "after", target: state("plan", { id: "phase-1" }) }],
            }),
          ],
        }),
      ],
    });

    const { manifest, files } = stateToFiles(original);
    const fileContents: Record<string, string> = {};
    for (const f of files) fileContents[f.path] = f.content;

    const restored = filesToState(manifest, fileContents);
    const goal = restored.children![0];
    const p1 = goal.children!.find((c) => c.id === "phase-1")!;
    const p2 = goal.children!.find((c) => c.id === "phase-2")!;

    expect(p1.links).toHaveLength(1);
    expect(p1.links![0].relation).toBe("before");
    expect(p1.links![0].target.id).toBe("phase-2");

    expect(p2.links).toHaveLength(1);
    expect(p2.links![0].relation).toBe("after");
    expect(p2.links![0].target.id).toBe("phase-1");
  });

  test("multiple encounters with distinct ids survive round-trip", () => {
    const original = state("individual", {
      id: "sean",
      information: "Feature: Sean",
      children: [
        state("identity"),
        state("knowledge"),
        state("encounter", { id: "task-a-finished", information: "Feature: Task A done" }),
        state("encounter", { id: "task-b-finished", information: "Feature: Task B done" }),
        state("encounter", { id: "goal-x-achieved", information: "Feature: Goal X achieved" }),
      ],
    });

    const { manifest, files } = stateToFiles(original);
    const fileContents: Record<string, string> = {};
    for (const f of files) {
      fileContents[f.path] = f.content;
    }

    const restored = filesToState(manifest, fileContents);

    const encounters = restored.children!.filter((c) => c.name === "encounter");
    expect(encounters).toHaveLength(3);
    expect(encounters.map((e) => e.id).sort()).toEqual([
      "goal-x-achieved",
      "task-a-finished",
      "task-b-finished",
    ]);

    const paths = files.map((f) => f.path);
    expect(paths).toContain("task-a-finished.encounter.feature");
    expect(paths).toContain("task-b-finished.encounter.feature");
    expect(paths).toContain("goal-x-achieved.encounter.feature");
  });
});
