import { describe, expect, test } from "bun:test";
import { toArgs } from "../src/dispatch.js";

describe("toArgs", () => {
  // ---- Simple mapping ----

  test("individual.born — content, id, alias", () => {
    expect(toArgs("individual.born", { content: "Feature: X", id: "sean", alias: ["s"] }))
      .toEqual(["Feature: X", "sean", ["s"]]);
  });

  test("individual.born — missing optional args produce undefined", () => {
    expect(toArgs("individual.born", {}))
      .toEqual([undefined, undefined, undefined]);
  });

  test("individual.teach — individual, content, id", () => {
    expect(toArgs("individual.teach", { individual: "sean", content: "Feature: P", id: "p1" }))
      .toEqual(["sean", "Feature: P", "p1"]);
  });

  test("org.hire — org, individual", () => {
    expect(toArgs("org.hire", { org: "rolex", individual: "sean" }))
      .toEqual(["rolex", "sean"]);
  });

  test("census.list — type", () => {
    expect(toArgs("census.list", { type: "individual" }))
      .toEqual(["individual"]);
  });

  test("prototype.charge — dir, position, content, id", () => {
    expect(toArgs("prototype.charge", { dir: "/tmp", position: "dev", content: "Feature: D", id: "d1" }))
      .toEqual(["/tmp", "dev", "Feature: D", "d1"]);
  });

  // ---- Role instructions ----

  test("role.activate — individual", () => {
    expect(toArgs("role.activate", { individual: "sean" }))
      .toEqual(["sean"]);
  });

  test("role.want — individual, goal, id, alias", () => {
    expect(toArgs("role.want", { individual: "sean", goal: "Feature: G", id: "g1" }))
      .toEqual(["sean", "Feature: G", "g1", undefined]);
  });

  test("role.plan — goal, plan, id, after, fallback", () => {
    expect(toArgs("role.plan", { goal: "g1", plan: "Feature: P", id: "p1", after: "p0" }))
      .toEqual(["g1", "Feature: P", "p1", "p0", undefined]);
  });

  test("role.finish — task, individual, encounter", () => {
    expect(toArgs("role.finish", { task: "t1", individual: "sean", encounter: "Feature: E" }))
      .toEqual(["t1", "sean", "Feature: E"]);
  });

  test("role.master — individual, procedure, id, experience", () => {
    expect(toArgs("role.master", { individual: "sean", procedure: "Feature: Proc", id: "proc1" }))
      .toEqual(["sean", "Feature: Proc", "proc1", undefined]);
  });

  // ---- Pack mapping (resource.push / resource.pull) ----

  test("resource.push — with registry packs into options object", () => {
    expect(toArgs("resource.push", { locator: "x", registry: "https://r.io" }))
      .toEqual(["x", { registry: "https://r.io" }]);
  });

  test("resource.push — without registry produces undefined", () => {
    expect(toArgs("resource.push", { locator: "x" }))
      .toEqual(["x", undefined]);
  });

  test("resource.pull — with registry packs into options object", () => {
    expect(toArgs("resource.pull", { locator: "x", registry: "https://r.io" }))
      .toEqual(["x", { registry: "https://r.io" }]);
  });

  test("resource.pull — without registry produces undefined", () => {
    expect(toArgs("resource.pull", { locator: "x" }))
      .toEqual(["x", undefined]);
  });

  // ---- Simple resource mapping ----

  test("resource.add — path", () => {
    expect(toArgs("resource.add", { path: "/tmp/res" }))
      .toEqual(["/tmp/res"]);
  });

  test("resource.clearCache — registry", () => {
    expect(toArgs("resource.clearCache", { registry: "https://r.io" }))
      .toEqual(["https://r.io"]);
  });

  // ---- Error handling ----

  test("unknown instruction throws", () => {
    expect(() => toArgs("unknown.op", {})).toThrow('Unknown instruction "unknown.op"');
  });
});
