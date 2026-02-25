import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "../src/index.js";

const testDir = join(tmpdir(), "rolex-proto-test");
const resourceDir = join(testDir, "resourcex");

afterEach(() => {
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

/** Write a ResourceX-compatible prototype directory. */
function writePrototype(
  baseDir: string,
  id: string,
  type: "role" | "organization",
  features: Record<string, string> = {}
): string {
  const manifestFile = type === "role" ? "individual.json" : "organization.json";
  const manifestType = type === "role" ? "individual" : "organization";
  const dir = join(baseDir, id);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    join(dir, "resource.json"),
    JSON.stringify({
      name: id,
      type,
      tag: "0.1.0",
      author: "test",
      description: `${id} prototype`,
    }),
    "utf-8"
  );

  writeFileSync(
    join(dir, manifestFile),
    JSON.stringify({
      id,
      type: manifestType,
      children: { identity: { type: "identity" } },
    }),
    "utf-8"
  );

  for (const [name, content] of Object.entries(features)) {
    writeFileSync(join(dir, name), content, "utf-8");
  }

  return dir;
}

describe("LocalPlatform Prototype (registry-based)", () => {
  test("resolve returns undefined for unknown id", async () => {
    const { prototype } = localPlatform({ dataDir: testDir, resourceDir });
    expect(await prototype!.resolve("unknown")).toBeUndefined();
  });

  test("resolve returns undefined when resourcex is disabled", async () => {
    const { prototype } = localPlatform({ dataDir: testDir, resourceDir: null });
    expect(await prototype!.resolve("sean")).toBeUndefined();
  });

  test("resolve returns undefined when dataDir is null", async () => {
    const { prototype } = localPlatform({ dataDir: null });
    expect(await prototype!.resolve("sean")).toBeUndefined();
  });

  test("settle + resolve round-trip for role", async () => {
    const protoDir = join(testDir, "protos");
    const dir = writePrototype(protoDir, "test-role", "role", {
      "test-role.individual.feature": "Feature: TestRole\n  Test role.",
    });

    const platform = localPlatform({ dataDir: testDir, resourceDir });
    platform.prototype!.settle("test-role", dir);

    const state = await platform.prototype!.resolve("test-role");
    expect(state).toBeDefined();
    expect(state!.id).toBe("test-role");
    expect(state!.name).toBe("individual");
    expect(state!.information).toBe("Feature: TestRole\n  Test role.");
    expect(state!.children).toHaveLength(1);
    expect(state!.children![0].name).toBe("identity");
  });

  test("settle + resolve round-trip for organization", async () => {
    const protoDir = join(testDir, "protos");
    const dir = writePrototype(protoDir, "deepractice", "organization", {
      "deepractice.organization.feature": "Feature: Deepractice\n  AI company.",
    });

    const platform = localPlatform({ dataDir: testDir, resourceDir });
    platform.prototype!.settle("deepractice", dir);

    const state = await platform.prototype!.resolve("deepractice");
    expect(state).toBeDefined();
    expect(state!.id).toBe("deepractice");
    expect(state!.name).toBe("organization");
    expect(state!.information).toBe("Feature: Deepractice\n  AI company.");
  });

  test("resolve returns undefined for unregistered id", async () => {
    const protoDir = join(testDir, "protos");
    const dir = writePrototype(protoDir, "test-role", "role");

    const platform = localPlatform({ dataDir: testDir, resourceDir });
    platform.prototype!.settle("test-role", dir);

    expect(await platform.prototype!.resolve("nobody")).toBeUndefined();
  });

  test("settle overwrites previous source", async () => {
    const protoDir = join(testDir, "protos");
    const dir1 = writePrototype(protoDir, "v1", "role", {
      "v1.individual.feature": "Feature: V1",
    });
    const dir2 = writePrototype(protoDir, "v2", "role", {
      "v2.individual.feature": "Feature: V2",
    });

    const platform = localPlatform({ dataDir: testDir, resourceDir });
    platform.prototype!.settle("test", dir1);
    platform.prototype!.settle("test", dir2);

    const state = await platform.prototype!.resolve("test");
    expect(state!.id).toBe("v2");
  });

  test("evict removes user-registered prototype", async () => {
    const protoDir = join(testDir, "protos");
    const dir = writePrototype(protoDir, "temp", "role");

    const platform = localPlatform({ dataDir: testDir, resourceDir });
    platform.prototype!.settle("temp", dir);
    expect(await platform.prototype!.resolve("temp")).toBeDefined();

    platform.prototype!.evict("temp");
    expect(await platform.prototype!.resolve("temp")).toBeUndefined();
  });

  test("registry persists across platform instances", async () => {
    const protoDir = join(testDir, "protos");
    const dir = writePrototype(protoDir, "test-role", "role");

    const p1 = localPlatform({ dataDir: testDir, resourceDir });
    p1.prototype!.settle("test-role", dir);

    const p2 = localPlatform({ dataDir: testDir, resourceDir });
    const state = await p2.prototype!.resolve("test-role");
    expect(state).toBeDefined();
    expect(state!.id).toBe("test-role");
  });

  test("bootstrap settles built-in prototypes on first run", async () => {
    const platform = localPlatform({ dataDir: testDir, resourceDir });
    await platform.initializer!.bootstrap();
    const list = platform.prototype!.list();
    expect(list.nuwa).toBe("nuwa");
    expect(list.rolex).toBe("rolex");
  });

  test("bootstrap is idempotent — second call is a no-op", async () => {
    const platform = localPlatform({ dataDir: testDir, resourceDir });
    await platform.initializer!.bootstrap();
    // Manually remove rolex to prove second bootstrap doesn't re-settle
    platform.prototype!.evict("rolex");
    await platform.initializer!.bootstrap();
    const list = platform.prototype!.list();
    expect(list.rolex).toBeUndefined(); // not re-settled
  });
});
