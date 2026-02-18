import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { localPlatform } from "../src/index.js";

const testDir = join(tmpdir(), "rolex-proto-test");

afterEach(() => {
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

function writePrototype(
  baseDir: string,
  kind: "role" | "organization",
  id: string,
  manifest: object,
  features: Record<string, string> = {}
) {
  const manifestName =
    kind === "role" ? "individual.json" : "organization.json";
  const dir = join(baseDir, "prototype", kind, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, manifestName), JSON.stringify(manifest), "utf-8");
  for (const [name, content] of Object.entries(features)) {
    writeFileSync(join(dir, name), content, "utf-8");
  }
}

describe("LocalPlatform Prototype", () => {
  test("resolve returns undefined when no prototype exists", () => {
    const { prototype } = localPlatform({ dataDir: testDir });
    expect(prototype!.resolve("nonexistent")).toBeUndefined();
  });

  test("resolve returns undefined when dataDir is null (in-memory)", () => {
    const { prototype } = localPlatform({ dataDir: null });
    expect(prototype!.resolve("sean")).toBeUndefined();
  });

  test("resolve loads role prototype by id", () => {
    writePrototype(testDir, "role", "sean", {
      id: "sean",
      type: "individual",
      children: {
        identity: {
          type: "identity",
        },
      },
    }, {
      "sean.individual.feature": "Feature: Sean\n  A backend architect.",
    });

    const { prototype } = localPlatform({ dataDir: testDir });
    const state = prototype!.resolve("sean");

    expect(state).toBeDefined();
    expect(state!.id).toBe("sean");
    expect(state!.name).toBe("individual");
    expect(state!.information).toBe("Feature: Sean\n  A backend architect.");
    expect(state!.children).toHaveLength(1);
    expect(state!.children![0].name).toBe("identity");
  });

  test("resolve loads organization prototype by id", () => {
    writePrototype(testDir, "organization", "deepractice", {
      id: "deepractice",
      type: "organization",
    }, {
      "deepractice.organization.feature": "Feature: Deepractice\n  AI company.",
    });

    const { prototype } = localPlatform({ dataDir: testDir });
    const state = prototype!.resolve("deepractice");

    expect(state).toBeDefined();
    expect(state!.id).toBe("deepractice");
    expect(state!.name).toBe("organization");
    expect(state!.information).toBe("Feature: Deepractice\n  AI company.");
  });

  test("resolve prefers role over organization when both exist", () => {
    writePrototype(testDir, "role", "test", {
      id: "test",
      type: "individual",
    });
    writePrototype(testDir, "organization", "test", {
      id: "test",
      type: "organization",
    });

    const { prototype } = localPlatform({ dataDir: testDir });
    const state = prototype!.resolve("test");

    expect(state).toBeDefined();
    expect(state!.name).toBe("individual");
  });

  test("prototype state has no refs (template, not runtime instance)", () => {
    writePrototype(testDir, "role", "nuwa", {
      id: "nuwa",
      type: "individual",
      children: {
        identity: { type: "identity" },
        knowledge: { type: "knowledge" },
      },
    });

    const { prototype } = localPlatform({ dataDir: testDir });
    const state = prototype!.resolve("nuwa");

    // Prototype states from files have no runtime refs
    expect(state!.ref).toBeUndefined();
  });

  test("resolve reads from disk each time (no stale cache)", () => {
    const { prototype } = localPlatform({ dataDir: testDir });

    // Initially no prototype
    expect(prototype!.resolve("sean")).toBeUndefined();

    // Write prototype to disk
    writePrototype(testDir, "role", "sean", {
      id: "sean",
      type: "individual",
    });

    // Should find it now (no cache)
    expect(prototype!.resolve("sean")).toBeDefined();
  });
});
