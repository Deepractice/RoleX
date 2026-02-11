import { describe, test, expect } from "bun:test";
import {
  createRuntime,
  society,
  individual,
  organization,
  persona,
  voice,
  memoir,
  philosophy,
  knowledge,
  pattern,
  procedure,
  theory,
  experience,
  insight,
  conclusion,
  goal,
  plan,
  task,
} from "../src/index.js";
import type { State } from "../src/index.js";

// Helper: collect all structure names from a state tree
const names = (state: State): string[] => {
  const result = [state.name];
  for (const child of state.children ?? []) {
    result.push(...names(child));
  }
  return result;
};

// Helper: find a child state by structure name
const findChild = (state: State, name: string): State | undefined =>
  (state.children ?? []).find(c => c.name === name);

describe("Individual — structure tree in memory", () => {
  test("bootstrap: create the full individual structure tree", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    rt.create(ind, persona, "I am a guide");
    rt.create(ind, voice);
    rt.create(ind, memoir);
    rt.create(ind, philosophy);
    rt.create(ind, knowledge);
    rt.create(ind, experience);

    const state = rt.project(soc);
    expect(state.name).toBe("society");
    expect(state.children).toHaveLength(1);

    const indState = state.children![0];
    expect(indState.name).toBe("individual");
    expect(indState.children).toHaveLength(6);

    const personaState = findChild(indState, "persona");
    expect(personaState).toBeDefined();
    expect(personaState!.information).toBe("I am a guide");
  });

  test("want: create a goal under individual", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const g = rt.create(ind, goal, "Learn TypeScript");

    const state = rt.project(ind);
    const goalState = findChild(state, "goal");
    expect(goalState).toBeDefined();
    expect(goalState!.information).toBe("Learn TypeScript");
    expect(g.name).toBe("goal");
  });

  test("design: create a plan under goal", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const g = rt.create(ind, goal, "Learn TypeScript");
    const p = rt.create(g, plan, "Read the handbook");

    const goalState = rt.project(g);
    const planState = findChild(goalState, "plan");
    expect(planState).toBeDefined();
    expect(planState!.information).toBe("Read the handbook");
    expect(p.name).toBe("plan");
  });

  test("todo: create a task under plan", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const g = rt.create(ind, goal);
    const p = rt.create(g, plan);
    const t = rt.create(p, task, "Read chapter 1");

    const planState = rt.project(p);
    const taskState = findChild(planState, "task");
    expect(taskState).toBeDefined();
    expect(taskState!.information).toBe("Read chapter 1");
    expect(t.name).toBe("task");
  });

  test("finish: transform task → conclusion (in experience branch)", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const exp = rt.create(ind, experience);
    const g = rt.create(ind, goal);
    const p = rt.create(g, plan);
    const t = rt.create(p, task, "Read chapter 1");

    // finish produces a conclusion in experience branch
    const conc = rt.transform(t, conclusion, "Chapter 1 done");

    expect(conc.name).toBe("conclusion");
    expect(conc.information).toBe("Chapter 1 done");

    // conclusion should be under experience
    const expState = rt.project(exp);
    const concState = findChild(expState, "conclusion");
    expect(concState).toBeDefined();
    expect(concState!.information).toBe("Chapter 1 done");
  });

  test("achieve: transform goal → conclusion + insight", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const exp = rt.create(ind, experience);
    const g = rt.create(ind, goal, "Learn TypeScript");

    // achieve produces conclusion + insight in experience branch
    const conc = rt.transform(g, conclusion, "Goal completed");
    const ins = rt.transform(g, insight, "Types prevent bugs");

    expect(conc.name).toBe("conclusion");
    expect(ins.name).toBe("insight");

    const expState = rt.project(exp);
    expect(expState.children).toHaveLength(2);
    expect(names(expState)).toContain("conclusion");
    expect(names(expState)).toContain("insight");
  });

  test("reflect: transform insight → pattern (in knowledge branch)", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const kn = rt.create(ind, knowledge);
    const exp = rt.create(ind, experience);

    // achieve: create insights
    const ins1 = rt.transform(null as any, insight, "Types catch bugs early");
    const ins2 = rt.transform(null as any, insight, "Strict mode is worth it");

    // reflect: transform insights → pattern
    const pat = rt.transform(ins1, pattern, "Static typing prevents runtime errors");

    expect(pat.name).toBe("pattern");

    // pattern should be under knowledge
    const knState = rt.project(kn);
    const patState = findChild(knState, "pattern");
    expect(patState).toBeDefined();
    expect(patState!.information).toBe("Static typing prevents runtime errors");

    // consume: remove reflected insights
    rt.remove(ins1);
    rt.remove(ins2);

    const expState = rt.project(exp);
    expect(expState.children).toHaveLength(0);
  });

  test("contemplate: transform pattern → theory (patterns preserved)", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const kn = rt.create(ind, knowledge);

    // teach: create patterns directly
    const pat1 = rt.create(kn, pattern, "Types prevent bugs");
    const pat2 = rt.create(kn, pattern, "Immutability reduces complexity");

    // contemplate: transform patterns → theory
    const th = rt.transform(pat1, theory, "Constraints liberate");

    expect(th.name).toBe("theory");

    // theory should be under knowledge
    const knState = rt.project(kn);
    expect(names(knState)).toContain("theory");

    // patterns are NOT consumed
    expect(knState.children).toHaveLength(3); // pat1 + pat2 + theory
  });

  test("forget: remove knowledge from identity", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const kn = rt.create(ind, knowledge);

    const pat = rt.create(kn, pattern, "Some principle");
    const proc = rt.create(kn, procedure, "Some workflow");

    expect(rt.project(kn).children).toHaveLength(2);

    // forget: remove pattern
    rt.remove(pat);

    const knState = rt.project(kn);
    expect(knState.children).toHaveLength(1);
    expect(knState.children![0].name).toBe("procedure");
  });

  test("abandon: transform goal → insight (optional)", () => {
    const rt = createRuntime();

    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    const exp = rt.create(ind, experience);
    const g = rt.create(ind, goal, "Unrealistic goal");

    // abandon with insight
    const ins = rt.transform(g, insight, "Know your limits");

    expect(ins.name).toBe("insight");

    const expState = rt.project(exp);
    expect(names(expState)).toContain("insight");
  });

  test("full lifecycle: want → design → todo → finish → achieve → reflect → contemplate", () => {
    const rt = createRuntime();

    // Bootstrap
    const soc = rt.create(null, society);
    const ind = rt.create(soc, individual);
    rt.create(ind, persona, "I am a learner");
    const kn = rt.create(ind, knowledge);
    const exp = rt.create(ind, experience);

    // === Execution cycle ===

    // want
    const g = rt.create(ind, goal, "Master systems theory");

    // design
    const p = rt.create(g, plan, "Study GST → build model → validate");

    // todo
    const t1 = rt.create(p, task, "Read Von Bertalanffy");
    const t2 = rt.create(p, task, "Implement tree model");

    // finish t1
    rt.transform(t1, conclusion, "Read complete");

    // finish t2
    rt.transform(t2, conclusion, "Model built with create/remove/transform");

    // achieve
    rt.transform(g, conclusion, "Systems theory model complete");
    const ins = rt.transform(g, insight, "Three primitives suffice for any tree operation");

    // === Growth cycle ===

    // reflect: insight → pattern
    const pat = rt.transform(ins, pattern, "Minimal primitives yield maximal expressiveness");
    rt.remove(ins); // consume insight

    // contemplate: pattern → theory
    rt.transform(pat, theory, "Simplicity is the ultimate sophistication");

    // === Verify final state ===
    const state = rt.project(ind);

    // knowledge should have: pattern + theory
    const knState = findChild(state, "knowledge")!;
    expect(names(knState)).toContain("pattern");
    expect(names(knState)).toContain("theory");

    // experience should have: 3 conclusions (2 finish + 1 achieve), no insights (consumed)
    const expState = findChild(state, "experience")!;
    const conclusions = (expState.children ?? []).filter(c => c.name === "conclusion");
    const insights = (expState.children ?? []).filter(c => c.name === "insight");
    expect(conclusions).toHaveLength(3);
    expect(insights).toHaveLength(0);

    // goal should have: plan with 2 tasks
    const goalState = findChild(state, "goal")!;
    const planState = findChild(goalState, "plan")!;
    expect(planState.children).toHaveLength(2);
  });
});
