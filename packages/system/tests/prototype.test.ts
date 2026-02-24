import { describe, expect, test } from "bun:test";
import type { State } from "../src/index.js";
import { createPrototype } from "../src/prototype.js";

const state = (
  name: string,
  opts?: { id?: string; information?: string; children?: State[] }
): State => ({
  name,
  description: "",
  parent: null,
  ...(opts?.id ? { id: opts.id } : {}),
  ...(opts?.information ? { information: opts.information } : {}),
  ...(opts?.children ? { children: opts.children } : {}),
});

describe("Prototype", () => {
  test("resolve returns undefined when no prototype seeded", async () => {
    const proto = createPrototype();
    expect(await proto.resolve("sean")).toBeUndefined();
  });

  test("seed and resolve a prototype by id", async () => {
    const proto = createPrototype();
    const template = state("individual", {
      id: "sean",
      children: [
        state("identity", { information: "Feature: Backend architect" }),
        state("knowledge"),
      ],
    });
    proto.seed(template);
    const resolved = await proto.resolve("sean");
    expect(resolved).toBeDefined();
    expect(resolved!.id).toBe("sean");
    expect(resolved!.children).toHaveLength(2);
  });

  test("seed throws if state has no id", () => {
    const proto = createPrototype();
    const template = state("individual");
    expect(() => proto.seed(template)).toThrow("must have an id");
  });

  test("later seed overwrites earlier one", async () => {
    const proto = createPrototype();
    proto.seed(state("individual", { id: "sean", information: "v1" }));
    proto.seed(state("individual", { id: "sean", information: "v2" }));
    expect((await proto.resolve("sean"))!.information).toBe("v2");
  });

  test("different ids resolve independently", async () => {
    const proto = createPrototype();
    proto.seed(state("individual", { id: "sean", information: "Sean" }));
    proto.seed(state("individual", { id: "nuwa", information: "Nuwa" }));
    expect((await proto.resolve("sean"))!.information).toBe("Sean");
    expect((await proto.resolve("nuwa"))!.information).toBe("Nuwa");
    expect(await proto.resolve("unknown")).toBeUndefined();
  });

  test("summon and list round-trip", () => {
    const proto = createPrototype();
    proto.summon("nuwa", "/path/to/nuwa");
    proto.summon("sean", "/path/to/sean");
    expect(proto.list()).toEqual({
      nuwa: "/path/to/nuwa",
      sean: "/path/to/sean",
    });
  });

  test("banish removes from list", () => {
    const proto = createPrototype();
    proto.summon("nuwa", "/path/to/nuwa");
    proto.summon("sean", "/path/to/sean");
    proto.banish("nuwa");
    expect(proto.list()).toEqual({ sean: "/path/to/sean" });
  });

  test("list returns empty when nothing registered", () => {
    const proto = createPrototype();
    expect(proto.list()).toEqual({});
  });
});
