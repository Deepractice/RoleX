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
  test("resolve returns undefined when no prototype registered", async () => {
    const proto = createPrototype();
    expect(await proto.resolve("sean")).toBeUndefined();
  });

  test("register and resolve a prototype by id", async () => {
    const proto = createPrototype();
    const template = state("individual", {
      id: "sean",
      children: [
        state("identity", { information: "Feature: Backend architect" }),
        state("knowledge"),
      ],
    });
    proto.register(template);
    const resolved = await proto.resolve("sean");
    expect(resolved).toBeDefined();
    expect(resolved!.id).toBe("sean");
    expect(resolved!.children).toHaveLength(2);
  });

  test("register throws if state has no id", () => {
    const proto = createPrototype();
    const template = state("individual");
    expect(() => proto.register(template)).toThrow("must have an id");
  });

  test("later registration overwrites earlier one", async () => {
    const proto = createPrototype();
    proto.register(state("individual", { id: "sean", information: "v1" }));
    proto.register(state("individual", { id: "sean", information: "v2" }));
    expect((await proto.resolve("sean"))!.information).toBe("v2");
  });

  test("different ids resolve independently", async () => {
    const proto = createPrototype();
    proto.register(state("individual", { id: "sean", information: "Sean" }));
    proto.register(state("individual", { id: "nuwa", information: "Nuwa" }));
    expect((await proto.resolve("sean"))!.information).toBe("Sean");
    expect((await proto.resolve("nuwa"))!.information).toBe("Nuwa");
    expect(await proto.resolve("unknown")).toBeUndefined();
  });
});
