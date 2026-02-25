import { describe, expect, test } from "bun:test";
import { drizzle } from "@deepracticex/drizzle";
import { openDatabase } from "@deepracticex/sqlite";
import * as C from "@rolexjs/core";
import { sql } from "drizzle-orm";
import { links, nodes } from "../src/schema.js";
import { createSqliteRuntime } from "../src/sqliteRuntime.js";

function setup() {
  const rawDb = openDatabase(":memory:");
  const db = drizzle(rawDb);
  // Create tables
  db.run(sql`CREATE TABLE nodes (
    ref TEXT PRIMARY KEY,
    id TEXT,
    alias TEXT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    parent_ref TEXT REFERENCES nodes(ref),
    information TEXT,
    tag TEXT
  )`);
  db.run(sql`CREATE TABLE links (
    from_ref TEXT NOT NULL REFERENCES nodes(ref),
    to_ref TEXT NOT NULL REFERENCES nodes(ref),
    relation TEXT NOT NULL,
    PRIMARY KEY (from_ref, to_ref, relation)
  )`);
  const rt = createSqliteRuntime(db);
  return { db, rt };
}

describe("SQLite Runtime", () => {
  test("create root node", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    expect(society.ref).toBe("n1");
    expect(society.name).toBe("society");
  });

  test("create child node", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean", ["Sean", "姜山"]);
    expect(ind.ref).toBe("n2");
    expect(ind.id).toBe("sean");
    expect(ind.name).toBe("individual");
    expect(ind.alias).toEqual(["Sean", "姜山"]);
    expect(ind.information).toBe("Feature: Sean");
  });

  test("project subtree", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean");
    rt.create(ind, C.identity, undefined, "identity");

    const state = rt.project(society);
    expect(state.children).toHaveLength(1);
    expect(state.children![0].id).toBe("sean");
    expect(state.children![0].children).toHaveLength(1);
    expect(state.children![0].children![0].id).toBe("identity");
  });

  test("remove subtree", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean");
    rt.create(ind, C.identity, undefined, "identity");

    rt.remove(ind);
    const state = rt.project(society);
    expect(state.children).toHaveLength(0);
  });

  test("link and unlink", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const org = rt.create(society, C.organization, "Feature: DP", "dp");
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean");

    rt.link(org, ind, "membership", "belong");

    let state = rt.project(org);
    expect(state.links).toHaveLength(1);
    expect(state.links![0].relation).toBe("membership");
    expect(state.links![0].target.id).toBe("sean");

    rt.unlink(org, ind, "membership", "belong");
    state = rt.project(org);
    expect(state.links).toBeUndefined();
  });

  test("tag node", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const goal = rt.create(society, C.goal, "Feature: Test", "test-goal");
    rt.tag(goal, "done");

    const state = rt.project(goal);
    expect(state.tag).toBe("done");
  });

  test("roots returns only root nodes", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    rt.create(society, C.individual, "Feature: Sean", "sean");

    const roots = rt.roots();
    expect(roots).toHaveLength(1);
    expect(roots[0].name).toBe("society");
  });

  test("transform creates node under target parent", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    rt.create(society, C.past);
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean");

    // Transform: create a "past" typed node (archive) — finds the past container by name
    const archived = rt.transform(ind, C.past, "Feature: Sean");
    expect(archived.name).toBe("past");
    expect(archived.information).toBe("Feature: Sean");
  });

  test("refs survive across operations (no stale refs)", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const ind = rt.create(society, C.individual, "Feature: Sean", "sean");
    const org = rt.create(society, C.organization, "Feature: DP", "dp");

    // Multiple operations — society ref should always be valid
    rt.link(org, ind, "membership", "belong");
    rt.create(org, C.charter, "Feature: Mission");

    // project using the original society ref — should work
    const state = rt.project(society);
    expect(state.children).toHaveLength(2); // individual + organization
  });

  test("position persists (the bug that triggered this rewrite)", () => {
    const { rt } = setup();
    const society = rt.create(null, C.society);
    const pos = rt.create(society, C.position, "Feature: Architect", "architect");

    // Project using the returned ref — this used to fail with "Node not found"
    const state = rt.project(pos);
    expect(state.name).toBe("position");
    expect(state.id).toBe("architect");

    // Also visible from society
    const societyState = rt.project(society);
    const names = societyState.children!.map((c) => c.name);
    expect(names).toContain("position");
  });
});
