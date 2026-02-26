/**
 * Alignment test — verify toArgs produces identical results
 * to the hand-written switch in rolex.ts (L199-288).
 *
 * Each test case mirrors one `case` in the original switch,
 * using the same input args and asserting the same output.
 */
import { describe, expect, test } from "bun:test";
import { toArgs } from "../src/dispatch.js";

describe("alignment with rolex.ts toArgs switch", () => {
  // ================================================================
  //  individual (L200-212)
  // ================================================================

  test("individual.born → [content, id, alias]", () => {
    const a = { content: "Feature: X", id: "sean", alias: ["s"] };
    expect(toArgs("individual.born", a)).toEqual([a.content, a.id, a.alias]);
  });

  test("individual.retire → [individual]", () => {
    const a = { individual: "sean" };
    expect(toArgs("individual.retire", a)).toEqual([a.individual]);
  });

  test("individual.die → [individual]", () => {
    const a = { individual: "sean" };
    expect(toArgs("individual.die", a)).toEqual([a.individual]);
  });

  test("individual.rehire → [individual]", () => {
    const a = { individual: "sean" };
    expect(toArgs("individual.rehire", a)).toEqual([a.individual]);
  });

  test("individual.teach → [individual, content, id]", () => {
    const a = { individual: "sean", content: "Feature: P", id: "p1" };
    expect(toArgs("individual.teach", a)).toEqual([a.individual, a.content, a.id]);
  });

  test("individual.train → [individual, content, id]", () => {
    const a = { individual: "sean", content: "Feature: Proc", id: "proc1" };
    expect(toArgs("individual.train", a)).toEqual([a.individual, a.content, a.id]);
  });

  // ================================================================
  //  org (L214-224)
  // ================================================================

  test("org.found → [content, id, alias]", () => {
    const a = { content: "Feature: Org", id: "rolex", alias: ["rx"] };
    expect(toArgs("org.found", a)).toEqual([a.content, a.id, a.alias]);
  });

  test("org.charter → [org, content]", () => {
    const a = { org: "rolex", content: "Feature: Charter" };
    expect(toArgs("org.charter", a)).toEqual([a.org, a.content]);
  });

  test("org.dissolve → [org]", () => {
    const a = { org: "rolex" };
    expect(toArgs("org.dissolve", a)).toEqual([a.org]);
  });

  test("org.hire → [org, individual]", () => {
    const a = { org: "rolex", individual: "sean" };
    expect(toArgs("org.hire", a)).toEqual([a.org, a.individual]);
  });

  test("org.fire → [org, individual]", () => {
    const a = { org: "rolex", individual: "sean" };
    expect(toArgs("org.fire", a)).toEqual([a.org, a.individual]);
  });

  // ================================================================
  //  position (L226-238)
  // ================================================================

  test("position.establish → [content, id, alias]", () => {
    const a = { content: "Feature: Pos", id: "dev", alias: ["developer"] };
    expect(toArgs("position.establish", a)).toEqual([a.content, a.id, a.alias]);
  });

  test("position.charge → [position, content, id]", () => {
    const a = { position: "dev", content: "Feature: Duty", id: "d1" };
    expect(toArgs("position.charge", a)).toEqual([a.position, a.content, a.id]);
  });

  test("position.require → [position, content, id]", () => {
    const a = { position: "dev", content: "Feature: Req", id: "r1" };
    expect(toArgs("position.require", a)).toEqual([a.position, a.content, a.id]);
  });

  test("position.abolish → [position]", () => {
    const a = { position: "dev" };
    expect(toArgs("position.abolish", a)).toEqual([a.position]);
  });

  test("position.appoint → [position, individual]", () => {
    const a = { position: "dev", individual: "sean" };
    expect(toArgs("position.appoint", a)).toEqual([a.position, a.individual]);
  });

  test("position.dismiss → [position, individual]", () => {
    const a = { position: "dev", individual: "sean" };
    expect(toArgs("position.dismiss", a)).toEqual([a.position, a.individual]);
  });

  // ================================================================
  //  census (L240-242)
  // ================================================================

  test("census.list → [type]", () => {
    const a = { type: "individual" };
    expect(toArgs("census.list", a)).toEqual([a.type]);
  });

  // ================================================================
  //  prototype (L244-266)
  // ================================================================

  test("prototype.settle → [source]", () => {
    const a = { source: "./prototypes/rolex" };
    expect(toArgs("prototype.settle", a)).toEqual([a.source]);
  });

  test("prototype.evict → [id]", () => {
    const a = { id: "nuwa" };
    expect(toArgs("prototype.evict", a)).toEqual([a.id]);
  });

  test("prototype.born → [dir, content, id, alias]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: X", id: "nuwa", alias: ["n"] };
    expect(toArgs("prototype.born", a)).toEqual([a.dir, a.content, a.id, a.alias]);
  });

  test("prototype.teach → [dir, content, id]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: P", id: "p1" };
    expect(toArgs("prototype.teach", a)).toEqual([a.dir, a.content, a.id]);
  });

  test("prototype.train → [dir, content, id]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: Proc", id: "proc1" };
    expect(toArgs("prototype.train", a)).toEqual([a.dir, a.content, a.id]);
  });

  test("prototype.found → [dir, content, id, alias]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: Org", id: "rolex", alias: ["rx"] };
    expect(toArgs("prototype.found", a)).toEqual([a.dir, a.content, a.id, a.alias]);
  });

  test("prototype.charter → [dir, content, id]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: Charter", id: "c1" };
    expect(toArgs("prototype.charter", a)).toEqual([a.dir, a.content, a.id]);
  });

  test("prototype.member → [dir, id, locator]", () => {
    const a = { dir: "/tmp/proto", id: "sean", locator: "deepractice/sean" };
    expect(toArgs("prototype.member", a)).toEqual([a.dir, a.id, a.locator]);
  });

  test("prototype.establish → [dir, content, id, appointments]", () => {
    const a = { dir: "/tmp/proto", content: "Feature: Pos", id: "dev", appointments: ["sean"] };
    expect(toArgs("prototype.establish", a)).toEqual([a.dir, a.content, a.id, a.appointments]);
  });

  test("prototype.charge → [dir, position, content, id]", () => {
    const a = { dir: "/tmp/proto", position: "dev", content: "Feature: Duty", id: "d1" };
    expect(toArgs("prototype.charge", a)).toEqual([a.dir, a.position, a.content, a.id]);
  });

  test("prototype.require → [dir, position, content, id]", () => {
    const a = { dir: "/tmp/proto", position: "dev", content: "Feature: Req", id: "r1" };
    expect(toArgs("prototype.require", a)).toEqual([a.dir, a.position, a.content, a.id]);
  });

  // ================================================================
  //  resource (L268-284)
  // ================================================================

  test("resource.add → [path]", () => {
    const a = { path: "/tmp/res" };
    expect(toArgs("resource.add", a)).toEqual([a.path]);
  });

  test("resource.search → [query]", () => {
    const a = { query: "hello" };
    expect(toArgs("resource.search", a)).toEqual([a.query]);
  });

  test("resource.has → [locator]", () => {
    const a = { locator: "deepractice/hello" };
    expect(toArgs("resource.has", a)).toEqual([a.locator]);
  });

  test("resource.info → [locator]", () => {
    const a = { locator: "deepractice/hello" };
    expect(toArgs("resource.info", a)).toEqual([a.locator]);
  });

  test("resource.remove → [locator]", () => {
    const a = { locator: "deepractice/hello" };
    expect(toArgs("resource.remove", a)).toEqual([a.locator]);
  });

  test("resource.push with registry → [locator, { registry }]", () => {
    const a = { locator: "x", registry: "https://r.io" };
    // rolex.ts: [a.locator, a.registry ? { registry: a.registry } : undefined]
    expect(toArgs("resource.push", a)).toEqual(["x", { registry: "https://r.io" }]);
  });

  test("resource.push without registry → [locator, undefined]", () => {
    const a = { locator: "x" };
    // rolex.ts: [a.locator, a.registry ? { registry: a.registry } : undefined]  →  ["x", undefined]
    expect(toArgs("resource.push", a)).toEqual(["x", undefined]);
  });

  test("resource.pull with registry → [locator, { registry }]", () => {
    const a = { locator: "x", registry: "https://r.io" };
    expect(toArgs("resource.pull", a)).toEqual(["x", { registry: "https://r.io" }]);
  });

  test("resource.pull without registry → [locator, undefined]", () => {
    const a = { locator: "x" };
    expect(toArgs("resource.pull", a)).toEqual(["x", undefined]);
  });

  test("resource.clearCache → [registry]", () => {
    const a = { registry: "https://r.io" };
    expect(toArgs("resource.clearCache", a)).toEqual([a.registry]);
  });
});
