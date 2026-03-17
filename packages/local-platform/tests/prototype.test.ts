import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "../src/index.js";

const testDir = join(tmpdir(), "rolex-proto-test");

afterEach(() => {
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

describe("LocalPlatform Prototype registry", () => {
  test("settle registers id → source", async () => {
    const { repository } = localPlatform({ dataDir: testDir });
    await repository.prototype.settle("test-role", "/path/to/source");
    expect((await repository.prototype.list())["test-role"]).toBe("/path/to/source");
  });

  test("settle overwrites previous source", async () => {
    const { repository } = localPlatform({ dataDir: testDir });
    await repository.prototype.settle("test", "/v1");
    await repository.prototype.settle("test", "/v2");
    expect((await repository.prototype.list()).test).toBe("/v2");
  });

  test("list returns empty object when no prototypes registered", async () => {
    const { repository } = localPlatform({ dataDir: testDir });
    expect(await repository.prototype.list()).toEqual({});
  });

  test("registry persists across platform instances", async () => {
    const p1 = localPlatform({ dataDir: testDir });
    await p1.repository.prototype.settle("test-role", "/path");

    const p2 = localPlatform({ dataDir: testDir });
    expect((await p2.repository.prototype.list())["test-role"]).toBe("/path");
  });
});
