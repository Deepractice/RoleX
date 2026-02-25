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

function readManifest(dir: string, type = "individual") {
  return JSON.parse(readFileSync(join(dir, `${type}.json`), "utf-8"));
}

function readFeature(dir: string, filename: string) {
  return readFileSync(join(dir, filename), "utf-8");
}

describe("PrototypeNamespace authoring", () => {
  beforeEach(() => {});
  afterEach(cleanup);

  describe("born", () => {
    test("creates directory, manifest, and feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      const r = rolex.prototype.born(dir, "Feature: My Role\n  A test role.", "my-role", [
        "MyRole",
      ]);

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
      rolex.prototype.born(dir, "Feature: Minimal", "minimal");

      const manifest = readManifest(dir);
      expect(manifest.alias).toBeUndefined();
    });

    test("creates manifest without feature file when content is omitted", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.prototype.born(dir, undefined, "empty-role");

      expect(existsSync(join(dir, "individual.json"))).toBe(true);
      expect(existsSync(join(dir, "empty-role.individual.feature"))).toBe(false);
    });

    test("throws when id is missing", () => {
      const rolex = setup();
      expect(() => rolex.prototype.born(protoDir(), "Feature: X")).toThrow("id is required");
    });

    test("validates Gherkin content", () => {
      const rolex = setup();
      expect(() => rolex.prototype.born(protoDir(), "not valid gherkin", "test")).toThrow(
        "Invalid Gherkin"
      );
    });
  });

  describe("teach", () => {
    test("adds principle to manifest and writes feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.prototype.born(dir, undefined, "my-role");
      const r = rolex.prototype.teach(
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
      expect(() => rolex.prototype.teach(protoDir(), "Feature: X", "x")).toThrow(
        "No manifest found"
      );
    });
  });

  describe("train", () => {
    test("adds procedure to manifest and writes feature file", () => {
      const rolex = setup();
      const dir = protoDir();
      rolex.prototype.born(dir, undefined, "my-role");
      const r = rolex.prototype.train(
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

  describe("full workflow — individual", () => {
    test("born → teach → train produces valid prototype", () => {
      const rolex = setup();
      const dir = protoDir();

      rolex.prototype.born(dir, "Feature: Backend Dev\n  A server-side engineer.", "backend-dev", [
        "Backend",
      ]);
      rolex.prototype.teach(dir, "Feature: DRY principle\n  Don't repeat yourself.", "dry");
      rolex.prototype.train(
        dir,
        "Feature: Deployment\n  https://example.com/skills/deploy",
        "deploy"
      );
      rolex.prototype.teach(dir, "Feature: KISS\n  Keep it simple.", "kiss");

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

  // ---- Organization authoring ----

  describe("found", () => {
    test("creates organization directory and manifest", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      const r = rolex.prototype.found(
        dir,
        "Feature: Deepractice\n  An AI agent framework company.",
        "deepractice",
        ["DP"]
      );

      expect(r.process).toBe("found");
      expect(r.state.id).toBe("deepractice");
      expect(r.state.name).toBe("organization");

      const manifest = readManifest(dir, "organization");
      expect(manifest.id).toBe("deepractice");
      expect(manifest.type).toBe("organization");
      expect(manifest.alias).toEqual(["DP"]);
      expect(manifest.children).toEqual({});

      const content = readFeature(dir, "deepractice.organization.feature");
      expect(content).toContain("Feature: Deepractice");
    });

    test("throws when id is missing", () => {
      const rolex = setup();
      expect(() => rolex.prototype.found(join(tmpDir, "x"), "Feature: X")).toThrow(
        "id is required"
      );
    });
  });

  describe("charter", () => {
    test("adds charter to organization manifest", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      const r = rolex.prototype.charter(
        dir,
        "Feature: Build great AI\n  Scenario: Mission\n    Given we believe in role-based AI",
        "mission"
      );

      expect(r.process).toBe("charter");
      expect(r.state.id).toBe("mission");
      expect(r.state.name).toBe("charter");

      const manifest = readManifest(dir, "organization");
      expect(manifest.children["mission"].type).toBe("charter");

      const content = readFeature(dir, "mission.charter.feature");
      expect(content).toContain("Build great AI");
    });

    test("defaults charter id to 'charter'", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      const r = rolex.prototype.charter(dir, "Feature: Our charter\n  We build things.");

      expect(r.state.id).toBe("charter");
      const manifest = readManifest(dir, "organization");
      expect(manifest.children["charter"].type).toBe("charter");
    });
  });

  describe("establish", () => {
    test("adds position to organization manifest", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      const r = rolex.prototype.establish(
        dir,
        "Feature: Backend Architect\n  Responsible for system design.",
        "architect"
      );

      expect(r.process).toBe("establish");
      expect(r.state.id).toBe("architect");
      expect(r.state.name).toBe("position");

      const manifest = readManifest(dir, "organization");
      expect(manifest.children["architect"].type).toBe("position");
      expect(manifest.children["architect"].children).toEqual({});

      const content = readFeature(dir, "architect.position.feature");
      expect(content).toContain("Backend Architect");
    });
  });

  describe("charge", () => {
    test("adds duty under position in manifest", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      rolex.prototype.establish(dir, "Feature: Architect", "architect");
      const r = rolex.prototype.charge(
        dir,
        "architect",
        "Feature: Design systems\n  Scenario: API design\n    Given a new service is needed\n    Then design the API first",
        "design-systems"
      );

      expect(r.process).toBe("charge");
      expect(r.state.id).toBe("design-systems");
      expect(r.state.name).toBe("duty");

      const manifest = readManifest(dir, "organization");
      expect(manifest.children["architect"].children["design-systems"].type).toBe("duty");

      const content = readFeature(dir, "design-systems.duty.feature");
      expect(content).toContain("Design systems");
    });

    test("throws when position not found", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      expect(() => rolex.prototype.charge(dir, "nonexistent", "Feature: X", "x")).toThrow(
        'Position "nonexistent" not found'
      );
    });
  });

  describe("require", () => {
    test("adds required skill under position in manifest", () => {
      const rolex = setup();
      const dir = join(tmpDir, "my-org");
      rolex.prototype.found(dir, undefined, "my-org");
      rolex.prototype.establish(dir, "Feature: Architect", "architect");
      const r = rolex.prototype.require(
        dir,
        "architect",
        "Feature: System Design\n  Scenario: When to apply\n    Given a new service is planned\n    Then design the architecture first",
        "system-design"
      );

      expect(r.process).toBe("require");
      expect(r.state.id).toBe("system-design");
      expect(r.state.name).toBe("requirement");

      const manifest = readManifest(dir, "organization");
      expect(manifest.children["architect"].children["system-design"].type).toBe("requirement");

      const content = readFeature(dir, "system-design.requirement.feature");
      expect(content).toContain("System Design");
    });
  });

  describe("full workflow — organization", () => {
    test("found → charter → establish → charge → require produces valid prototype", () => {
      const rolex = setup();
      const dir = join(tmpDir, "dp-org");

      rolex.prototype.found(
        dir,
        "Feature: Deepractice\n  AI agent framework company.",
        "deepractice",
        ["DP"]
      );
      rolex.prototype.charter(
        dir,
        "Feature: Build role-based AI\n  Scenario: Mission\n    Given AI needs identity",
        "mission"
      );
      rolex.prototype.establish(
        dir,
        "Feature: Backend Architect\n  System design lead.",
        "architect"
      );
      rolex.prototype.charge(
        dir,
        "architect",
        "Feature: Design APIs\n  Scenario: New service\n    Given a service is needed\n    Then design API first",
        "design-apis"
      );
      rolex.prototype.require(
        dir,
        "architect",
        "Feature: System Design Skill\n  Scenario: When to apply\n    Given architecture decisions needed\n    Then apply systematic design",
        "system-design"
      );

      const manifest = readManifest(dir, "organization");
      expect(manifest.id).toBe("deepractice");
      expect(manifest.type).toBe("organization");
      expect(manifest.alias).toEqual(["DP"]);
      expect(Object.keys(manifest.children)).toEqual(["mission", "architect"]);
      expect(manifest.children["mission"].type).toBe("charter");
      expect(manifest.children["architect"].type).toBe("position");
      expect(manifest.children["architect"].children["design-apis"].type).toBe("duty");
      expect(manifest.children["architect"].children["system-design"].type).toBe("requirement");

      // All feature files exist
      expect(existsSync(join(dir, "deepractice.organization.feature"))).toBe(true);
      expect(existsSync(join(dir, "mission.charter.feature"))).toBe(true);
      expect(existsSync(join(dir, "architect.position.feature"))).toBe(true);
      expect(existsSync(join(dir, "design-apis.duty.feature"))).toBe(true);
      expect(existsSync(join(dir, "system-design.requirement.feature"))).toBe(true);
    });
  });
});
