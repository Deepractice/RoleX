import { describe, test, expect, afterAll } from "bun:test";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LocalPlatform } from "../src/LocalPlatform";

const testDir = join(tmpdir(), `rolex-test-${Date.now()}`);

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("LocalPlatform — cross-process index visibility", () => {
  test("listStructures sees externally added structures without restart", () => {
    const platform = new LocalPlatform(testDir);

    // Initial state: create one structure via platform API
    platform.createStructure("alice");
    expect(platform.listStructures()).toEqual(["alice"]);

    // Simulate another process writing to index.json directly
    const indexPath = join(testDir, "index.json");
    writeFileSync(
      indexPath,
      JSON.stringify({ structures: { alice: null, bob: null } }, null, 2),
      "utf-8",
    );
    mkdirSync(join(testDir, "bob"), { recursive: true });

    // Same platform instance should see the new structure
    expect(platform.listStructures()).toEqual(["alice", "bob"]);
    expect(platform.hasStructure("bob")).toBe(true);
  });
});
