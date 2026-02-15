import { describe, test, expect } from "bun:test";
import {
  structure,
  relation,
  create,
  remove,
  transform,
  link,
  unlink,
  process,
  createRuntime,
} from "../src/index.js";

// ================================================================
//  Structure & Relation definition
// ================================================================

describe("Structure", () => {
  test("define a root structure", () => {
    const world = structure("world", "The root concept", null);
    expect(world.name).toBe("world");
    expect(world.description).toBe("The root concept");
    expect(world.parent).toBeNull();
    expect(world.ref).toBeUndefined();
  });

  test("define a child structure", () => {
    const world = structure("world", "The root", null);
    const agent = structure("agent", "An agent", world);
    expect(agent.parent).toBe(world);
  });

  test("define structure with relations", () => {
    const world = structure("world", "Root", null);
    const agent = structure("agent", "An agent", world);
    const org = structure("org", "An organization", world);
    const position = structure("position", "A role in org", org, [
      relation("appointment", "Who holds this position", agent),
    ]);
    expect(position.relations).toHaveLength(1);
    expect(position.relations![0].name).toBe("appointment");
    expect(position.relations![0].target).toBe(agent);
  });

  test("structure without relations has no relations field", () => {
    const world = structure("world", "Root", null);
    expect(world.relations).toBeUndefined();
  });
});

describe("Relation", () => {
  test("define a relation", () => {
    const agent = structure("agent", "An agent", null);
    const rel = relation("appointment", "Who holds this", agent);
    expect(rel.name).toBe("appointment");
    expect(rel.description).toBe("Who holds this");
    expect(rel.target).toBe(agent);
  });
});

// ================================================================
//  Process definition
// ================================================================

describe("Process", () => {
  test("define a read-only process (no ops)", () => {
    const agent = structure("agent", "An agent", null);
    const identity = process("identity", "Project identity", agent);
    expect(identity.name).toBe("identity");
    expect(identity.ops).toHaveLength(0);
  });

  test("define a process with create op", () => {
    const agent = structure("agent", "An agent", null);
    const goal = structure("goal", "A goal", agent);
    const want = process("want", "Declare a goal", agent, create(goal));
    expect(want.ops).toHaveLength(1);
    expect(want.ops[0].op).toBe("create");
  });

  test("define a process with transform op", () => {
    const agent = structure("agent", "An agent", null);
    const goal = structure("goal", "A goal", agent);
    const exp = structure("experience", "Experience", agent);
    const achieve = process("achieve", "Complete a goal", goal, transform(goal, exp));
    expect(achieve.ops).toHaveLength(1);
    expect(achieve.ops[0].op).toBe("transform");
  });

  test("define a process with link op", () => {
    const world = structure("world", "Root", null);
    const agent = structure("agent", "An agent", world);
    const org = structure("org", "An organization", world);
    const position = structure("position", "Position", org, [
      relation("appointment", "Holder", agent),
    ]);
    const appoint = process(
      "appoint",
      "Assign an agent to a position",
      position,
      link(position, "appointment")
    );
    expect(appoint.ops).toHaveLength(1);
    expect(appoint.ops[0].op).toBe("link");
  });

  test("define a process with unlink op", () => {
    const world = structure("world", "Root", null);
    const agent = structure("agent", "An agent", world);
    const position = structure("position", "Position", world);
    const dismiss = process(
      "dismiss",
      "Remove from position",
      position,
      unlink(position, "appointment")
    );
    expect(dismiss.ops).toHaveLength(1);
    expect(dismiss.ops[0].op).toBe("unlink");
  });
});

// ================================================================
//  Runtime — tree operations
// ================================================================

describe("Runtime", () => {
  // Concept definitions (shared across tests)
  const world = structure("world", "Root", null);
  const agent = structure("agent", "An agent", world);
  const knowledge = structure("knowledge", "What I know", agent);
  const experience = structure("experience", "What I learned", agent);
  const insight = structure("insight", "A specific learning", experience);

  describe("create & project", () => {
    test("create root and project it", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      expect(root.ref).toBeDefined();
      expect(root.name).toBe("world");

      const state = rt.project(root);
      expect(state.name).toBe("world");
      expect(state.children).toHaveLength(0);
    });

    test("create child under parent", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);
      expect(a.name).toBe("agent");

      const state = rt.project(root);
      expect(state.children).toHaveLength(1);
      expect(state.children![0].name).toBe("agent");
    });

    test("create node with information", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent, "Feature: I am Sean");

      const state = rt.project(a);
      expect(state.information).toBe("Feature: I am Sean");
    });

    test("node is concept + container + information carrier", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);

      // experience as information carrier (no children)
      const exp1 = rt.create(a, experience, "Feature: I learned JWT...");
      const s1 = rt.project(exp1);
      expect(s1.information).toBe("Feature: I learned JWT...");
      expect(s1.children).toHaveLength(0);

      // experience as container (has children, no information)
      const exp2 = rt.create(a, experience);
      const ins = rt.create(exp2, insight, "Feature: JWT refresh is key");
      const s2 = rt.project(exp2);
      expect(s2.information).toBeUndefined();
      expect(s2.children).toHaveLength(1);
      expect(s2.children![0].name).toBe("insight");
      expect(s2.children![0].information).toBe("Feature: JWT refresh is key");
    });

    test("deep tree projection", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);
      const k = rt.create(a, knowledge);
      const exp = rt.create(a, experience);
      const ins = rt.create(exp, insight, "Feature: learned something");

      const state = rt.project(root);
      expect(state.children).toHaveLength(1); // agent
      expect(state.children![0].children).toHaveLength(2); // knowledge, experience
      const expState = state.children![0].children![1];
      expect(expState.children).toHaveLength(1); // insight
      expect(expState.children![0].information).toBe("Feature: learned something");
    });
  });

  describe("remove", () => {
    test("remove a leaf node", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);
      const k = rt.create(a, knowledge);

      rt.remove(k);
      const state = rt.project(a);
      expect(state.children).toHaveLength(0);
    });

    test("remove a subtree", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);
      const exp = rt.create(a, experience);
      const ins = rt.create(exp, insight, "data");

      rt.remove(exp); // removes experience + insight
      const state = rt.project(a);
      expect(state.children).toHaveLength(0);
    });

    test("remove node without ref is a no-op", () => {
      const rt = createRuntime();
      rt.remove(agent); // no ref, should not throw
    });
  });

  describe("transform", () => {
    test("transform creates node in target branch", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);
      const exp = rt.create(a, experience);
      const goalDef = structure("goal", "A goal", agent);
      const g = rt.create(a, goalDef, "Feature: Build auth");

      // transform goal into insight (under experience)
      const ins = rt.transform(g, insight, "Feature: Auth lessons");
      expect(ins.name).toBe("insight");
      expect(ins.information).toBe("Feature: Auth lessons");

      const state = rt.project(exp);
      expect(state.children).toHaveLength(1);
      expect(state.children![0].name).toBe("insight");
    });
  });

  // ================================================================
  //  Runtime — link/unlink operations
  // ================================================================

  describe("link & unlink", () => {
    const org = structure("org", "An organization", world);
    const position = structure("position", "A role in org", org, [
      relation("appointment", "Who holds this", agent),
    ]);

    test("link two nodes and see it in projection", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent, "Feature: I am Sean");
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");

      const state = rt.project(arch);
      expect(state.links).toHaveLength(1);
      expect(state.links![0].relation).toBe("appointment");
      expect(state.links![0].target.name).toBe("agent");
      expect(state.links![0].target.information).toBe("Feature: I am Sean");
    });

    test("link is idempotent", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");
      rt.link(arch, sean, "appointment"); // duplicate

      const state = rt.project(arch);
      expect(state.links).toHaveLength(1);
    });

    test("unlink removes the relation", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");
      rt.unlink(arch, sean, "appointment");

      const state = rt.project(arch);
      expect(state.links).toBeUndefined();
    });

    test("node without links has no links in projection", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const a = rt.create(root, agent);

      const state = rt.project(a);
      expect(state.links).toBeUndefined();
    });

    test("multiple links from one node", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      const alice = rt.create(root, agent);
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");
      rt.link(arch, alice, "appointment");

      const state = rt.project(arch);
      expect(state.links).toHaveLength(2);
    });

    test("remove node cleans up its outgoing links", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");
      rt.remove(arch);

      // arch is gone, linking to it should not appear anywhere
      const state = rt.project(dp);
      expect(state.children).toHaveLength(0);
    });

    test("remove target node cleans up incoming links", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");
      rt.remove(sean); // remove the target

      const state = rt.project(arch);
      expect(state.links).toBeUndefined(); // link should be cleaned up
    });

    test("link throws if source has no ref", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      expect(() => rt.link(agent, sean, "test")).toThrow("Source node has no ref");
    });

    test("link throws if target has no ref", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent);
      expect(() => rt.link(sean, agent, "test")).toThrow("Target node has no ref");
    });

    test("parent projection includes child links", () => {
      const rt = createRuntime();
      const root = rt.create(null, world);
      const sean = rt.create(root, agent, "Feature: I am Sean");
      const dp = rt.create(root, org);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment");

      // project from org level — should see position with its link
      const state = rt.project(dp);
      expect(state.children).toHaveLength(1);
      expect(state.children![0].links).toHaveLength(1);
      expect(state.children![0].links![0].target.name).toBe("agent");
    });
  });
});
