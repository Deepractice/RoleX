import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "../src/index.js";

const testDir = join(tmpdir(), "rolex-proto-test");
const resourceDir = join(testDir, "resourcex");

afterEach(() => {
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

describe("LocalPlatform Prototype registry", () => {
  test("settle registers id → source", () => {
    const { prototype } = localPlatform({ dataDir: testDir, resourceDir });
    prototype!.settle("test-role", "/path/to/source");
    expect(prototype!.list()["test-role"]).toBe("/path/to/source");
  });

  test("settle overwrites previous source", () => {
    const { prototype } = localPlatform({ dataDir: testDir, resourceDir });
    prototype!.settle("test", "/v1");
    prototype!.settle("test", "/v2");
    expect(prototype!.list().test).toBe("/v2");
  });

  test("list returns empty object when no prototypes registered", () => {
    const { prototype } = localPlatform({ dataDir: testDir, resourceDir });
    expect(prototype!.list()).toEqual({});
  });

  test("registry persists across platform instances", () => {
    const p1 = localPlatform({ dataDir: testDir, resourceDir });
    p1.prototype!.settle("test-role", "/path");

    const p2 = localPlatform({ dataDir: testDir, resourceDir });
    expect(p2.prototype!.list()["test-role"]).toBe("/path");
  });
});
