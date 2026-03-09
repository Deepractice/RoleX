import { describe, expect, test } from "bun:test";
import { instructions } from "../src/instructions.js";

describe("instructions registry", () => {
  test("has at least one namespace", () => {
    const namespaces = new Set(Object.values(instructions).map((d) => d.namespace));
    expect(namespaces.size).toBeGreaterThan(0);
  });

  test("every namespace has at least one method", () => {
    const byNamespace = new Map<string, string[]>();
    for (const def of Object.values(instructions)) {
      const methods = byNamespace.get(def.namespace) ?? [];
      methods.push(def.method);
      byNamespace.set(def.namespace, methods);
    }
    for (const [_ns, methods] of byNamespace) {
      expect(methods.length).toBeGreaterThan(0);
    }
  });

  test("every key matches namespace.method pattern", () => {
    for (const [key, def] of Object.entries(instructions)) {
      expect(key).toBe(`${def.namespace}.${def.method}`);
    }
  });

  test("every instruction with params has at least one arg entry", () => {
    for (const [_key, def] of Object.entries(instructions)) {
      const paramCount = Object.keys(def.params).length;
      if (paramCount > 0) {
        expect(def.args.length).toBeGreaterThan(0);
      }
    }
  });

  test("no duplicate methods within a namespace", () => {
    const byNamespace = new Map<string, string[]>();
    for (const def of Object.values(instructions)) {
      const methods = byNamespace.get(def.namespace) ?? [];
      methods.push(def.method);
      byNamespace.set(def.namespace, methods);
    }
    for (const [_ns, methods] of byNamespace) {
      expect(new Set(methods).size).toBe(methods.length);
    }
  });
});
