import { describe, expect, test } from "bun:test";
import { drizzle } from "@deepracticex/drizzle";
import { openDatabase } from "@deepracticex/sqlite";
import * as C from "@rolexjs/core";
import { sql } from "drizzle-orm";
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
  test("create root node", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    expect(society.ref).toBe("n1");
    expect(society.name).toBe("society");
  });

  test("create child node", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean", ["Sean", "姜山"]);
    expect(ind.ref).toBe("n2");
    expect(ind.id).toBe("sean");
    expect(ind.name).toBe("individual");
    expect(ind.alias).toEqual(["Sean", "姜山"]);
    expect(ind.information).toBe("Feature: Sean");
  });

  test("project subtree", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean");
    await rt.create(ind, C.identity, undefined, "identity");

    const state = await rt.project(society);
    expect(state.children).toHaveLength(1);
    expect(state.children![0].id).toBe("sean");
    expect(state.children![0].children).toHaveLength(1);
    expect(state.children![0].children![0].id).toBe("identity");
  });

  test("remove subtree", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean");
    await rt.create(ind, C.identity, undefined, "identity");

    await rt.remove(ind);
    const state = await rt.project(society);
    expect(state.children).toHaveLength(0);
  });

  test("link and unlink", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const org = await rt.create(society, C.organization, "Feature: DP", "dp");
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean");

    await rt.link(org, ind, "membership", "belong");

    let state = await rt.project(org);
    expect(state.links).toHaveLength(1);
    expect(state.links![0].relation).toBe("membership");
    expect(state.links![0].target.id).toBe("sean");

    await rt.unlink(org, ind, "membership", "belong");
    state = await rt.project(org);
    expect(state.links).toBeUndefined();
  });

  test("addTag and removeTag", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const goal = await rt.create(society, C.goal, "Feature: Test", "test-goal");
    await rt.addTag(goal, "done");

    let state = await rt.project(goal);
    expect(state.tags).toEqual(["done"]);

    await rt.addTag(goal, "urgent");
    state = await rt.project(goal);
    expect(state.tags).toEqual(["done", "urgent"]);

    await rt.removeTag(goal, "done");
    state = await rt.project(goal);
    expect(state.tags).toEqual(["urgent"]);

    await rt.removeTag(goal, "urgent");
    state = await rt.project(goal);
    expect(state.tags).toBeUndefined();
  });

  test("roots returns only root nodes", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    await rt.create(society, C.individual, "Feature: Sean", "sean");

    const roots = await rt.roots();
    expect(roots).toHaveLength(1);
    expect(roots[0].name).toBe("society");
  });

  test("transform creates node under target parent", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    await rt.create(society, C.past);
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean");

    // Transform: create a "past" typed node (archive) — finds the past container by name
    const archived = await rt.transform(ind, C.past, "Feature: Sean");
    expect(archived.name).toBe("past");
    expect(archived.information).toBe("Feature: Sean");
  });

  test("refs survive across operations (no stale refs)", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const ind = await rt.create(society, C.individual, "Feature: Sean", "sean");
    const org = await rt.create(society, C.organization, "Feature: DP", "dp");

    // Multiple operations — society ref should always be valid
    await rt.link(org, ind, "membership", "belong");
    await rt.create(org, C.charter, "Feature: Mission");

    // project using the original society ref — should work
    const state = await rt.project(society);
    expect(state.children).toHaveLength(2); // individual + organization
  });

  test("position persists (the bug that triggered this rewrite)", async () => {
    const { rt } = setup();
    const society = await rt.create(null, C.society);
    const pos = await rt.create(society, C.position, "Feature: Architect", "architect");

    // Project using the returned ref — this used to fail with "Node not found"
    const state = await rt.project(pos);
    expect(state.name).toBe("position");
    expect(state.id).toBe("architect");

    // Also visible from society
    const societyState = await rt.project(society);
    const names = societyState.children!.map((c) => c.name);
    expect(names).toContain("position");
  });
});
