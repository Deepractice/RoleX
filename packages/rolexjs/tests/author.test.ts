import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localPlatform } from "@rolexjs/local-platform";
import { createRoleX } from "../src/rolex.js";

let tmpDir: string;

function setup() {
  tmpDir = mkdtempSync(join(tmpdir(), "rolex-author-"));
  return createRoleX(localPlatform({ dataDir: null }));
}

function cleanup() {
  if (tmpDir && existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true });
  }
}

function protoDir() {
  return join(tmpDir, "my-role");
}

function readManifest(dir: string) {
  return JSON.parse(readFileSync(join(dir, "individual.json"), "utf-8"));
}

function readFeature(dir: string, filename: string) {
  return readFileSync(join(dir, filename), "utf-8");
}

describe("AuthorNamespace", () => {
  beforeEach(() => {});
  afterEach(cleanup);

  describe("born", () => {
    test("creates directory, manifest, and feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      const r = rolex.author.born(dir, "Feature: My Role\n  A test role.", "my-role", ["MyRole"]);

      expect(r.process).toBe("born");
      expect(r.state.id).toBe("my-role");
      expect(r.state.name).toBe("individual");

      // manifest
      const manifest = readManifest(dir);
      expect(manifest.id).toBe("my-role");
      expect(manifest.type).toBe("individual");
      expect(manifest.alias).toEqual(["MyRole"]);
      expect(manifest.children.identity.type).toBe("identity");

      // feature file
      const content = readFeature(dir, "my-role.individual.feature");
      expect(content).toContain("Feature: My Role");
    });

    test("creates manifest without alias when not provided", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.author.born(dir, "Feature: Minimal", "minimal");

      const manifest = readManifest(dir);
      expect(manifest.alias).toBeUndefined();
    });

    test("creates manifest without feature file when content is omitted", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.author.born(dir, undefined, "empty-role");

      expect(existsSync(join(dir, "individual.json"))).toBe(true);
      expect(existsSync(join(dir, "empty-role.individual.feature"))).toBe(false);
    });

    test("throws when id is missing", () => {
      const rolex = setup();
      expect(() => rolex.author.born(protoDir(), "Feature: X")).toThrow("id is required");
    });

    test("validates Gherkin content", () => {
      const rolex = setup();
      expect(() => rolex.author.born(protoDir(), "not valid gherkin", "test")).toThrow(
        "Invalid Gherkin"
      );
    });
  });

  describe("teach", () => {
    test("adds principle to manifest and writes feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.author.born(dir, undefined, "my-role");
      const r = rolex.author.teach(
        dir,
        "Feature: Always test first\n  Tests before code.",
        "tdd-first"
      );

      expect(r.process).toBe("teach");
      expect(r.state.id).toBe("tdd-first");
      expect(r.state.name).toBe("principle");

      // manifest updated
      const manifest = readManifest(dir);
      expect(manifest.children["tdd-first"].type).toBe("principle");
      // identity still there
      expect(manifest.children.identity.type).toBe("identity");

      // feature file
      const content = readFeature(dir, "tdd-first.principle.feature");
      expect(content).toContain("Feature: Always test first");
    });

    test("throws when no manifest exists", () => {
      const rolex = setup();
      expect(() => rolex.author.teach(protoDir(), "Feature: X", "x")).toThrow("No individual.json");
    });
  });

  describe("train", () => {
    test("adds procedure to manifest and writes feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.author.born(dir, undefined, "my-role");
      const r = rolex.author.train(
        dir,
        "Feature: Code Review\n  https://example.com/skills/code-review",
        "code-review"
      );

      expect(r.process).toBe("train");
      expect(r.state.id).toBe("code-review");
      expect(r.state.name).toBe("procedure");

      // manifest updated
      const manifest = readManifest(dir);
      expect(manifest.children["code-review"].type).toBe("procedure");

      // feature file
      const content = readFeature(dir, "code-review.procedure.feature");
      expect(content).toContain("Code Review");
    });
  });

  describe("full workflow", () => {
    test("born → teach → train produces valid prototype", () => {
      const rolex = setup();
      const dir = protoDir();

      rolex.author.born(dir, "Feature: Backend Dev\n  A server-side engineer.", "backend-dev", [
        "Backend",
      ]);
      rolex.author.teach(dir, "Feature: DRY principle\n  Don't repeat yourself.", "dry");
      rolex.author.train(dir, "Feature: Deployment\n  https://example.com/skills/deploy", "deploy");
      rolex.author.teach(dir, "Feature: KISS\n  Keep it simple.", "kiss");

      const manifest = readManifest(dir);
      expect(manifest.id).toBe("backend-dev");
      expect(manifest.alias).toEqual(["Backend"]);
      expect(Object.keys(manifest.children)).toEqual(["identity", "dry", "deploy", "kiss"]);
      expect(manifest.children.dry.type).toBe("principle");
      expect(manifest.children.deploy.type).toBe("procedure");
      expect(manifest.children.kiss.type).toBe("principle");

      // All feature files exist
      expect(existsSync(join(dir, "backend-dev.individual.feature"))).toBe(true);
      expect(existsSync(join(dir, "dry.principle.feature"))).toBe(true);
      expect(existsSync(join(dir, "deploy.procedure.feature"))).toBe(true);
      expect(existsSync(join(dir, "kiss.principle.feature"))).toBe(true);
    });
  });
});
