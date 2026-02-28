import { describe, expect, test } from "bun:test";
import { processes, world } from "../src/descriptions/index.js";

describe("descriptions", () => {
  test("processes is non-empty", () => {
    expect(Object.keys(processes).length).toBeGreaterThan(0);
  });

  test("world is non-empty", () => {
    expect(Object.keys(world).length).toBeGreaterThan(0);
  });

  test("every process description starts with Feature:", () => {
    for (const [_name, content] of Object.entries(processes)) {
      expect(content).toMatch(/^Feature:/);
    }
  });

  test("every world description starts with Feature:", () => {
    for (const [_name, content] of Object.entries(world)) {
      expect(content).toMatch(/^Feature:/);
    }
  });

  test("key role operations have process descriptions", () => {
    const expected = [
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
    ];
    for (const name of expected) {
      expect(processes[name]).toBeDefined();
    }
  });

  test("key world features are present", () => {
    const expected = [
      "cognitive-priority",
      "role-identity",
      "nuwa",
      "execution",
      "cognition",
      "memory",
      "gherkin",
      "communication",
      "skill-system",
      "state-origin",
    ];
    for (const name of expected) {
      expect(world[name]).toBeDefined();
    }
  });
});
