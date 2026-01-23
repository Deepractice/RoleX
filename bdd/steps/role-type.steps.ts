/**
 * Role Type Step Definitions
 * BDD steps for ResourceX integration feature
 * @rolexjs/bdd
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { RoleXWorld } from "../support/world.js";

// ============================================
// Given steps
// ============================================

Given("a registry with role type registered", async function (this: RoleXWorld) {
  const { createRegistry } = await import("resourcexjs");
  const { createRoleType } = await import("rolexjs");

  // Create registry first (needed for createRoleType)
  const tempRegistry = createRegistry({ path: this.testDir });

  // Create role type with bound registry
  const roleType = createRoleType(tempRegistry);

  // Recreate registry with role type registered
  this.registry = createRegistry({
    path: this.testDir,
    types: [roleType],
  });
});

Given(
  "a role resource linked to registry with locator {string}",
  async function (this: RoleXWorld, locator: string) {
    this.roleLocator = locator;
    this.roleFiles = new Map();
  }
);

Given("a role RXR with locator {string}", async function (this: RoleXWorld, locator: string) {
  this.roleLocator = locator;
  this.roleFiles = new Map();
});

Given("a serialized role buffer from {string}", async function (this: RoleXWorld, locator: string) {
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");
  const { roleType } = await import("rolexjs");

  // Create a role RXR
  const rxl = parseRXL(locator);
  const manifest = createRXM({
    domain: rxl.domain ?? "localhost",
    name: rxl.name,
    type: "role",
    version: rxl.version ?? "1.0.0",
  });

  const rxc = await createRXC({
    "test.role.md": "<role><personality>Test role content.</personality></role>",
  });

  const rxr = {
    locator: rxl,
    manifest,
    content: rxc,
  };

  // Serialize using roleType
  this.serializedBuffer = await roleType.serializer.serialize(rxr);
  this.currentRxr = rxr;
});

Given(
  "a role folder at {string} with structure:",
  async function (
    this: RoleXWorld,
    folderPath: string,
    dataTable: { hashes: () => Array<{ path: string; content: string }> }
  ) {
    const rows = dataTable.hashes();
    const fullFolderPath = join(this.testDir, folderPath);

    for (const row of rows) {
      const filePath = join(fullFolderPath, row.path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, row.content, "utf-8");
    }
  }
);

// ============================================
// When steps
// ============================================

When("I resolve {string} from registry", async function (this: RoleXWorld, locator: string) {
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");

  try {
    // Create and link RXR if we have role files
    if (this.roleFiles.size > 0) {
      const rxl = parseRXL(locator);
      const manifest = createRXM({
        domain: rxl.domain ?? "localhost",
        name: rxl.name,
        type: "role",
        version: rxl.version ?? "1.0.0",
      });

      const filesObject: Record<string, string> = {};
      for (const [path, content] of this.roleFiles) {
        filesObject[path] = content;
      }
      const rxc = await createRXC(filesObject);

      const rxr = {
        locator: rxl,
        manifest,
        content: rxc,
      };

      await this.registry!.link(rxr);
      this.currentRxr = rxr;
    }

    // Resolve from registry
    this.resolvedResource = await this.registry!.resolve(locator);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("I serialize the role using roleType", async function (this: RoleXWorld) {
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");
  const { roleType } = await import("rolexjs");

  try {
    // Create RXR from role files
    const rxl = parseRXL(this.roleLocator!);
    const manifest = createRXM({
      domain: rxl.domain ?? "localhost",
      name: rxl.name,
      type: "role",
      version: rxl.version ?? "1.0.0",
    });

    const filesObject: Record<string, string> = {};
    for (const [path, content] of this.roleFiles) {
      filesObject[path] = content;
    }
    const rxc = await createRXC(filesObject);

    const rxr = {
      locator: rxl,
      manifest,
      content: rxc,
    };

    this.currentRxr = rxr;
    this.serializedBuffer = await roleType.serializer.serialize(rxr);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("I deserialize the buffer using roleType", async function (this: RoleXWorld) {
  const { roleType } = await import("rolexjs");

  try {
    const rxr = await roleType.serializer.deserialize(
      this.serializedBuffer!,
      this.currentRxr!.manifest
    );
    this.currentRxr = rxr;
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("I load the folder as RXR", async function (this: RoleXWorld) {
  // This step is for folder-based loading - implementation depends on ResourceX
  // For now, we'll mark as pending since it requires additional ResourceX APIs
  return "pending";
});

When("I link it to registry", async function (this: RoleXWorld) {
  try {
    await this.registry!.link(this.currentRxr!);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("I execute the resolved resource", async function (this: RoleXWorld) {
  try {
    this.renderedRole = await this.resolvedResource!.execute();
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("executing the result should return a rendered role", async function (this: RoleXWorld) {
  try {
    this.renderedRole = await this.resolvedResource!.execute();
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

// ============================================
// Then steps
// ============================================

Then("the resolution should succeed", function (this: RoleXWorld) {
  assert.ok(!this.error, `Resolution failed: ${this.error?.message}`);
  assert.ok(this.resolvedResource, "ResolvedResource should exist");
});

Then("the serialization should succeed", function (this: RoleXWorld) {
  assert.ok(!this.error, `Serialization failed: ${this.error?.message}`);
  assert.ok(this.serializedBuffer, "Serialized buffer should exist");
});

Then("the result should be a Buffer", function (this: RoleXWorld) {
  assert.ok(Buffer.isBuffer(this.serializedBuffer), "Result should be a Buffer");
});

Then("the deserialization should succeed", function (this: RoleXWorld) {
  assert.ok(!this.error, `Deserialization failed: ${this.error?.message}`);
  assert.ok(this.currentRxr, "Deserialized RXR should exist");
});

Then("the result should be a valid RXR", function (this: RoleXWorld) {
  assert.ok(this.currentRxr, "RXR should exist");
  assert.ok(this.currentRxr.locator, "RXR should have locator");
  assert.ok(this.currentRxr.manifest, "RXR should have manifest");
  assert.ok(this.currentRxr.content, "RXR should have content");
});

Then(
  "the RXR content should contain {string}",
  async function (this: RoleXWorld, expected: string) {
    assert.ok(this.currentRxr, "RXR should exist");
    const files = await this.currentRxr.content.files();
    const fileNames = Array.from(files.keys());
    const found = fileNames.some((name) => name.includes(expected));
    assert.ok(
      found,
      `RXR content should contain file matching "${expected}", got: ${fileNames.join(", ")}`
    );
  }
);

Then("roleType name should be {string}", async function (this: RoleXWorld, expected: string) {
  const { roleType } = await import("rolexjs");
  assert.equal(roleType.name, expected);
});

Then(
  "roleType aliases should include {string}",
  async function (this: RoleXWorld, expected: string) {
    const { roleType } = await import("rolexjs");
    assert.ok(
      roleType.aliases?.includes(expected),
      `Aliases should include "${expected}", got: ${roleType.aliases?.join(", ")}`
    );
  }
);
