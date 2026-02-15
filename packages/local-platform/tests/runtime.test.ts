import { describe, test, expect } from "bun:test";
import { structure, relation } from "@rolexjs/system";
import { localPlatform } from "../src/index.js";

function createGraphRuntime() {
  return localPlatform({ dataDir: null }).runtime;
}

// ================================================================
//  Concept definitions (mirrors @rolexjs/core structures)
// ================================================================

const society = structure("society", "The RoleX world", null);

const individual = structure("individual", "A single agent in society", society);
const organization = structure("organization", "A group of individuals", society, [
  relation("membership", "Who belongs to this organization", individual),
]);
const past = structure("past", "Things no longer active", society);

const identity = structure("identity", "Who I am", individual);
const background = structure("background", "My personal background", identity);
const tone = structure("tone", "My tone of communication", identity);
const mindset = structure("mindset", "How I think", identity);

const encounter = structure("encounter", "A specific event I went through", individual);
const experience = structure("experience", "What I learned from encounters", individual);

const knowledge = structure("knowledge", "What I know", individual);
const principle = structure("principle", "My rules of conduct", knowledge);
const skill = structure("skill", "My abilities and how-to", knowledge);

const goal = structure("goal", "What I am pursuing", individual);
const plan = structure("plan", "How to achieve a goal", goal);
const task = structure("task", "Concrete unit of work", plan);

const charter = structure("charter", "The rules and mission", organization);
const position = structure("position", "A role held by an individual", organization, [
  relation("appointment", "Who holds this position", individual),
]);
const duty = structure("duty", "Responsibilities of this position", position);

// ================================================================
//  Tests
// ================================================================

describe("Graph Runtime", () => {
  // ============================================================
  //  create & project
  // ============================================================

  describe("create & project", () => {
    test("create root node", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);

      expect(root.ref).toBeDefined();
      expect(root.name).toBe("society");

      const state = rt.project(root);
      expect(state.name).toBe("society");
      expect(state.children).toHaveLength(0);
    });

    test("create child under parent", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);

      expect(sean.name).toBe("individual");

      const state = rt.project(root);
      expect(state.children).toHaveLength(1);
      expect(state.children![0].name).toBe("individual");
    });

    test("create node with information", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: I am Sean");

      const state = rt.project(sean);
      expect(state.information).toBe("Feature: I am Sean");
    });

    test("node is concept + container + information carrier", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);

      // experience as information carrier (no children)
      const exp1 = rt.create(sean, experience, "Feature: I learned JWT...");
      const s1 = rt.project(exp1);
      expect(s1.information).toBe("Feature: I learned JWT...");
      expect(s1.children).toHaveLength(0);

      // experience as container (has children)
      const exp2 = rt.create(sean, experience);
      const child = rt.create(exp2, encounter, "Feature: JWT incident");
      const s2 = rt.project(exp2);
      expect(s2.information).toBeUndefined();
      expect(s2.children).toHaveLength(1);
      expect(s2.children![0].name).toBe("encounter");
    });

    test("deep tree — society > individual > identity > background", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const id = rt.create(sean, identity);
      const bg = rt.create(id, background, "Feature: CS from MIT");

      const state = rt.project(root);
      expect(state.children).toHaveLength(1);
      const indState = state.children![0];
      expect(indState.children).toHaveLength(1);
      const idState = indState.children![0];
      expect(idState.children).toHaveLength(1);
      expect(idState.children![0].name).toBe("background");
      expect(idState.children![0].information).toBe("Feature: CS from MIT");
    });

    test("multiple children under same parent", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const id = rt.create(sean, identity);

      rt.create(id, background, "Feature: My background");
      rt.create(id, tone, "Feature: My tone");
      rt.create(id, mindset, "Feature: My mindset");

      const state = rt.project(id);
      expect(state.children).toHaveLength(3);
      const names = state.children!.map((c) => c.name);
      expect(names).toContain("background");
      expect(names).toContain("tone");
      expect(names).toContain("mindset");
    });
  });

  // ============================================================
  //  remove
  // ============================================================

  describe("remove", () => {
    test("remove a leaf node", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const k = rt.create(sean, knowledge);

      rt.remove(k);
      const state = rt.project(sean);
      expect(state.children).toHaveLength(0);
    });

    test("remove a subtree", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const id = rt.create(sean, identity);
      rt.create(id, background, "bg");
      rt.create(id, tone, "tone");
      rt.create(id, mindset, "mindset");

      rt.remove(id); // removes identity + background + tone + mindset
      const state = rt.project(sean);
      expect(state.children).toHaveLength(0);
    });

    test("remove node without ref is a no-op", () => {
      const rt = createGraphRuntime();
      rt.remove(individual); // no ref, should not throw
    });
  });

  // ============================================================
  //  transform
  // ============================================================

  describe("transform", () => {
    test("finish: transform task → encounter", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const g = rt.create(sean, goal, "Feature: Build auth");
      const p = rt.create(g, plan, "Feature: Auth plan");
      const t = rt.create(p, task, "Feature: Implement login");

      const enc = rt.transform(t, encounter, "Feature: Login done, learned about JWT");
      expect(enc.name).toBe("encounter");
      expect(enc.information).toBe("Feature: Login done, learned about JWT");

      // encounter should be under individual (sean)
      const state = rt.project(sean);
      const encounterStates = state.children!.filter((c) => c.name === "encounter");
      expect(encounterStates).toHaveLength(1);
    });

    test("achieve: transform goal → encounter", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      rt.create(sean, goal, "Feature: Build auth");

      const enc = rt.transform(sean, encounter, "Feature: Auth achieved");
      expect(enc.name).toBe("encounter");

      const state = rt.project(sean);
      const encounters = state.children!.filter((c) => c.name === "encounter");
      expect(encounters).toHaveLength(1);
    });

    test("reflect: transform encounter → experience", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const enc = rt.create(sean, encounter, "Feature: JWT incident");

      const exp = rt.transform(enc, experience, "Feature: Always use refresh tokens");
      expect(exp.name).toBe("experience");

      const state = rt.project(sean);
      const experiences = state.children!.filter((c) => c.name === "experience");
      expect(experiences).toHaveLength(1);
      expect(experiences[0].information).toBe("Feature: Always use refresh tokens");
    });

    test("realize: transform experience → principle", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      rt.create(sean, knowledge);
      const exp = rt.create(sean, experience, "Feature: Auth lessons");

      const prin = rt.transform(exp, principle, "Feature: Security first");
      expect(prin.name).toBe("principle");

      // principle should be under knowledge
      const state = rt.project(sean);
      const knowledgeState = state.children!.find((c) => c.name === "knowledge");
      expect(knowledgeState).toBeDefined();
      expect(knowledgeState!.children).toHaveLength(1);
      expect(knowledgeState!.children![0].name).toBe("principle");
    });

    test("retire: transform individual → past", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      rt.create(root, past);
      const sean = rt.create(root, individual, "Feature: Sean");

      const retired = rt.transform(sean, past, "Feature: Sean retired");
      expect(retired.name).toBe("past");

      // past node should exist under society
      const state = rt.project(root);
      const pastNodes = state.children!.filter((c) => c.name === "past");
      expect(pastNodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================
  //  link & unlink
  // ============================================================

  describe("link & unlink", () => {
    test("hire: link organization membership", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: I am Sean");
      const dp = rt.create(root, organization);

      rt.link(dp, sean, "membership", "belong");

      const state = rt.project(dp);
      expect(state.links).toHaveLength(1);
      expect(state.links![0].relation).toBe("membership");
      expect(state.links![0].target.name).toBe("individual");
      expect(state.links![0].target.information).toBe("Feature: I am Sean");
    });

    test("fire: unlink organization membership", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const dp = rt.create(root, organization);

      rt.link(dp, sean, "membership", "belong");
      rt.unlink(dp, sean, "membership", "belong");

      const state = rt.project(dp);
      expect(state.links).toBeUndefined();
    });

    test("appoint: link position appointment", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: I am Sean");
      const dp = rt.create(root, organization);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment", "serve");

      const state = rt.project(arch);
      expect(state.links).toHaveLength(1);
      expect(state.links![0].relation).toBe("appointment");
      expect(state.links![0].target.name).toBe("individual");
    });

    test("dismiss: unlink position appointment", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const dp = rt.create(root, organization);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment", "serve");
      rt.unlink(arch, sean, "appointment", "serve");

      const state = rt.project(arch);
      expect(state.links).toBeUndefined();
    });

    test("link is idempotent", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const dp = rt.create(root, organization);

      rt.link(dp, sean, "membership", "belong");
      rt.link(dp, sean, "membership", "belong"); // duplicate

      const state = rt.project(dp);
      expect(state.links).toHaveLength(1);
    });

    test("multiple members in one organization", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean");
      const alice = rt.create(root, individual, "Feature: Alice");
      const dp = rt.create(root, organization);

      rt.link(dp, sean, "membership", "belong");
      rt.link(dp, alice, "membership", "belong");

      const state = rt.project(dp);
      expect(state.links).toHaveLength(2);
    });

    test("parent projection includes child links", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean");
      const dp = rt.create(root, organization);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment", "serve");

      // project from org level
      const state = rt.project(dp);
      expect(state.children).toHaveLength(1);
      expect(state.children![0].links).toHaveLength(1);
      expect(state.children![0].links![0].target.name).toBe("individual");
    });

    test("remove source node cleans up outgoing links", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const dp = rt.create(root, organization);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment", "serve");
      rt.remove(arch);

      const state = rt.project(dp);
      expect(state.children).toHaveLength(0);
    });

    test("remove target node cleans up incoming links", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      const dp = rt.create(root, organization);
      const arch = rt.create(dp, position);

      rt.link(arch, sean, "appointment", "serve");
      rt.remove(sean);

      const state = rt.project(arch);
      expect(state.links).toBeUndefined();
    });

    test("link throws if source has no ref", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      expect(() => rt.link(individual, sean, "test", "test-rev")).toThrow("Source node has no ref");
    });

    test("link throws if target has no ref", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      expect(() => rt.link(sean, individual, "test", "test-rev")).toThrow("Target node has no ref");
    });

    test("node without links has no links in projection", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);

      const state = rt.project(sean);
      expect(state.links).toBeUndefined();
    });
  });

  // ============================================================
  //  Full scenario: execution cycle
  // ============================================================

  describe("execution cycle", () => {
    test("want → plan → todo → finish → reflect → realize", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual);
      rt.create(sean, knowledge);

      // want: create goal
      const g = rt.create(sean, goal, "Feature: Build auth system");
      expect(g.name).toBe("goal");

      // plan: create plan under goal
      const p = rt.create(g, plan, "Feature: Auth implementation plan");
      expect(p.name).toBe("plan");

      // todo: create task under plan
      const t = rt.create(p, task, "Feature: Implement JWT login");
      expect(t.name).toBe("task");

      // finish: transform task → encounter
      const enc = rt.transform(t, encounter, "Feature: JWT login done");
      expect(enc.name).toBe("encounter");

      // reflect: transform encounter → experience
      const exp = rt.transform(enc, experience, "Feature: JWT refresh tokens are essential");
      expect(exp.name).toBe("experience");

      // realize: transform experience → principle
      const prin = rt.transform(
        exp,
        principle,
        "Feature: Always use short-lived tokens with refresh"
      );
      expect(prin.name).toBe("principle");

      // verify final state
      const state = rt.project(sean);
      const knowledgeState = state.children!.find((c) => c.name === "knowledge");
      expect(knowledgeState).toBeDefined();
      expect(knowledgeState!.children).toHaveLength(1);
      expect(knowledgeState!.children![0].name).toBe("principle");
      expect(knowledgeState!.children![0].information).toBe(
        "Feature: Always use short-lived tokens with refresh"
      );
    });
  });

  // ============================================================
  //  Full scenario: organization
  // ============================================================

  describe("organization scenario", () => {
    test("found → establish → born → hire → appoint → dismiss → fire", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);

      // found: create organization
      const dp = rt.create(root, organization);

      // establish: create position
      const arch = rt.create(dp, position);
      const archDuty = rt.create(arch, duty, "Feature: Design system architecture");

      // born: create individual
      const sean = rt.create(root, individual, "Feature: I am Sean");

      // hire: link membership
      rt.link(dp, sean, "membership", "belong");
      let orgState = rt.project(dp);
      expect(orgState.links).toHaveLength(1);
      expect(orgState.links![0].relation).toBe("membership");

      // appoint: link appointment
      rt.link(arch, sean, "appointment", "serve");
      let posState = rt.project(arch);
      expect(posState.links).toHaveLength(1);
      expect(posState.links![0].relation).toBe("appointment");

      // dismiss: unlink appointment
      rt.unlink(arch, sean, "appointment", "serve");
      posState = rt.project(arch);
      expect(posState.links).toBeUndefined();

      // fire: unlink membership
      rt.unlink(dp, sean, "membership", "belong");
      orgState = rt.project(dp);
      expect(orgState.links).toBeUndefined();

      // individual still exists
      const seanState = rt.project(sean);
      expect(seanState.name).toBe("individual");
    });
  });

  // ============================================================
  //  id & alias
  // ============================================================

  describe("id & alias", () => {
    test("create with id stores it on node", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean", "sean");
      expect(sean.ref).toBeDefined();
      expect(sean.id).toBe("sean");
    });

    test("create with id and alias stores both", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean", "sean", ["Sean", "姜山"]);
      expect(sean.id).toBe("sean");
      expect(sean.alias).toEqual(["Sean", "姜山"]);
    });

    test("id and alias appear in projection", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean", "sean", ["Sean"]);
      const state = rt.project(sean);
      expect(state.id).toBe("sean");
      expect(state.alias).toEqual(["Sean"]);
    });

    test("create without id has no id field", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society);
      const sean = rt.create(root, individual, "Feature: Sean");
      expect(sean.id).toBeUndefined();
      expect(sean.alias).toBeUndefined();
    });

    test("id and alias appear in roots()", () => {
      const rt = createGraphRuntime();
      const root = rt.create(null, society, undefined, "world", ["World"]);
      const roots = rt.roots();
      expect(roots).toHaveLength(1);
      expect(roots[0].id).toBe("world");
      expect(roots[0].alias).toEqual(["World"]);
    });
  });
});
