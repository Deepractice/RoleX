import { describe, expect, test } from "bun:test";
import { instructions } from "../src/instructions.js";

describe("instructions registry", () => {
  test("all expected namespaces are present", () => {
    const namespaces = new Set(Object.values(instructions).map((d) => d.namespace));
    expect(namespaces).toEqual(
      new Set(["individual", "role", "org", "position", "census", "prototype", "resource"])
    );
  });

  test("individual — 6 methods", () => {
    const methods = methodsOf("individual");
    expect(methods).toEqual(["born", "retire", "die", "rehire", "teach", "train"]);
  });

  test("role — 13 methods", () => {
    const methods = methodsOf("role");
    expect(methods).toEqual([
      "activate",
      "focus",
      "want",
      "plan",
      "todo",
      "finish",
      "complete",
      "abandon",
      "reflect",
      "realize",
      "master",
      "forget",
      "skill",
    ]);
  });

  test("org — 5 methods", () => {
    const methods = methodsOf("org");
    expect(methods).toEqual(["found", "charter", "dissolve", "hire", "fire"]);
  });

  test("position — 6 methods", () => {
    const methods = methodsOf("position");
    expect(methods).toEqual(["establish", "charge", "require", "abolish", "appoint", "dismiss"]);
  });

  test("census — 1 method", () => {
    expect(methodsOf("census")).toEqual(["list"]);
  });

  test("prototype — 2 methods", () => {
    const methods = methodsOf("prototype");
    expect(methods).toEqual(["settle", "evict"]);
  });

  test("resource — 8 methods", () => {
    const methods = methodsOf("resource");
    expect(methods).toEqual([
      "add",
      "search",
      "has",
      "info",
      "remove",
      "push",
      "pull",
      "clearCache",
    ]);
  });

  test("total instruction count is 41", () => {
    expect(Object.keys(instructions).length).toBe(41);
  });

  test("every instruction has matching namespace.method key", () => {
    for (const [key, def] of Object.entries(instructions)) {
      expect(key).toBe(`${def.namespace}.${def.method}`);
    }
  });

  test("every instruction has at least one arg entry or zero params", () => {
    for (const [_key, def] of Object.entries(instructions)) {
      const paramCount = Object.keys(def.params).length;
      if (paramCount > 0) {
        expect(def.args.length).toBeGreaterThan(0);
      }
    }
  });
});

/** Extract methods for a namespace, preserving registry order. */
function methodsOf(namespace: string): string[] {
  return Object.values(instructions)
    .filter((d) => d.namespace === namespace)
    .map((d) => d.method);
}
