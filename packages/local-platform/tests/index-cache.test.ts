import { describe, test, expect, afterAll } from "bun:test";
import { writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LocalPlatform } from "../src/LocalPlatform";

const testDir = join(tmpdir(), `rolex-test-${Date.now()}`);

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("LocalPlatform — graph persistence", () => {
  test("loadGraph returns empty graph when no file exists", () => {
    const platform = new LocalPlatform(testDir);
    const graph = platform.loadGraph();
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  test("saveGraph + loadGraph round-trip", () => {
    const platform = new LocalPlatform(testDir);
    const data = {
      nodes: [
        { key: "sean", attributes: { type: "role", shadow: false, state: {} } },
        { key: "sean/persona", attributes: { type: "persona", shadow: false, state: {} } },
      ],
      edges: [
        { source: "sean", target: "sean/persona", attributes: { type: "has-info" }, undirected: false },
      ],
    };
    platform.saveGraph(data);

    const loaded = platform.loadGraph();
    expect(loaded.nodes).toHaveLength(2);
    expect(loaded.edges).toHaveLength(1);
    expect(loaded.nodes[0].key).toBe("sean");
  });

  test("cross-process graph visibility — reads latest file", () => {
    const platform = new LocalPlatform(testDir);

    // Simulate another process writing graph.json directly
    const graphPath = join(testDir, "graph.json");
    writeFileSync(
      graphPath,
      JSON.stringify({
        nodes: [
          { key: "alice", attributes: { type: "role", shadow: false, state: {} } },
          { key: "bob", attributes: { type: "role", shadow: false, state: {} } },
        ],
        edges: [],
      }),
      "utf-8"
    );

    // Same platform instance should see the new data
    const loaded = platform.loadGraph();
    expect(loaded.nodes).toHaveLength(2);
    expect(loaded.nodes.map((n: any) => n.key)).toContain("bob");
  });
});

describe("LocalPlatform — content storage", () => {
  const contentDir = join(tmpdir(), `rolex-content-${Date.now()}`);
  const platform = new LocalPlatform(contentDir);

  afterAll(() => {
    rmSync(contentDir, { recursive: true, force: true });
  });

  test("writeContent + readContent round-trip", () => {
    const feature = {
      name: "Sean",
      description: "A backend architect",
      tags: [],
      children: [
        {
          scenario: {
            name: "Background",
            tags: [],
            steps: [{ keyword: "Given ", text: "I am a backend architect" }],
          },
        },
      ],
    } as any;

    platform.writeContent("sean/persona", feature);

    const contentPath = join(contentDir, "content", "sean", "persona.feature");
    expect(existsSync(contentPath)).toBe(true);

    const loaded = platform.readContent("sean/persona");
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe("Sean");
  });

  test("readContent returns null for non-existent key", () => {
    expect(platform.readContent("nonexistent/key")).toBeNull();
  });

  test("removeContent deletes the file", () => {
    platform.writeContent("temp/item", {
      name: "Temp",
      tags: [],
      children: [],
    } as any);
    expect(platform.readContent("temp/item")).not.toBeNull();

    platform.removeContent("temp/item");
    expect(platform.readContent("temp/item")).toBeNull();
  });
});

describe("LocalPlatform — shadow cleanup", () => {
  const shadowDir = join(tmpdir(), `rolex-shadow-${Date.now()}`);
  const platform = new LocalPlatform(shadowDir);

  afterAll(() => {
    rmSync(shadowDir, { recursive: true, force: true });
  });

  test("saveGraph removes content files for shadowed nodes", () => {
    // Write content first
    platform.writeContent("role/task-a", {
      name: "Task A",
      tags: [],
      children: [],
    } as any);
    platform.writeContent("role/task-b", {
      name: "Task B",
      tags: [],
      children: [],
    } as any);

    expect(platform.readContent("role/task-a")).not.toBeNull();
    expect(platform.readContent("role/task-b")).not.toBeNull();

    // Save graph with task-a shadowed, task-b not
    platform.saveGraph({
      nodes: [
        { key: "role/task-a", attributes: { type: "task", shadow: true, state: {} } },
        { key: "role/task-b", attributes: { type: "task", shadow: false, state: {} } },
      ],
      edges: [],
    });

    // Shadowed content should be removed
    expect(platform.readContent("role/task-a")).toBeNull();
    // Non-shadowed content should remain
    expect(platform.readContent("role/task-b")).not.toBeNull();
  });

  test("shadow cleanup is idempotent — missing files are skipped", () => {
    platform.saveGraph({
      nodes: [
        { key: "role/nonexistent", attributes: { type: "task", shadow: true, state: {} } },
      ],
      edges: [],
    });
    // Should not throw
    expect(platform.readContent("role/nonexistent")).toBeNull();
  });
});

describe("LocalPlatform — settings", () => {
  const settingsDir = join(tmpdir(), `rolex-settings-${Date.now()}`);
  const platform = new LocalPlatform(settingsDir);

  afterAll(() => {
    rmSync(settingsDir, { recursive: true, force: true });
  });

  test("readSettings returns empty object when no file exists", () => {
    expect(platform.readSettings()).toEqual({});
  });

  test("writeSettings + readSettings round-trip", () => {
    platform.writeSettings({ locale: "zh" });
    expect(platform.readSettings()).toEqual({ locale: "zh" });
  });

  test("writeSettings merges with existing", () => {
    platform.writeSettings({ locale: "en" });
    platform.writeSettings({ theme: "dark" });
    expect(platform.readSettings()).toEqual({ locale: "en", theme: "dark" });
  });
});
