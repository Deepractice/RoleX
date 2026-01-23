/**
 * Role Loading Step Definitions
 * BDD steps for role loading feature
 * @rolexjs/bdd
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import type { RoleXWorld } from "../support/world.js";

// ============================================
// Given steps
// ============================================

Given("a registry is created", async function (this: RoleXWorld) {
  const { createRegistry } = await import("resourcexjs");
  const { createRoleType } = await import("rolexjs");

  // Create temporary registry to get role type
  const tempRegistry = createRegistry({ path: this.testDir });
  const roleType = createRoleType(tempRegistry);

  // Create registry with role type support
  this.registry = createRegistry({
    path: this.testDir,
    types: [roleType],
  });
});

Given("a role resource with locator {string}", async function (this: RoleXWorld, locator: string) {
  // Link previous resource if exists
  if (this.roleLocator && this.roleFiles.size > 0) {
    const { createRXM, createRXC, parseRXL } = await import("resourcexjs");

    const rxl = parseRXL(this.roleLocator);

    // Use "text" for non-role types since they're not registered
    let resourceType = rxl.type ?? "role";
    if (resourceType !== "role") {
      resourceType = "text";
    }

    const manifest = createRXM({
      domain: rxl.domain ?? "localhost",
      name: rxl.name,
      type: resourceType,
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
  }

  this.roleLocator = locator;
  this.roleFiles = new Map();
});

Given(
  "the role has main file {string} with content:",
  async function (this: RoleXWorld, fileName: string, content: string) {
    this.roleFiles.set(fileName, content);
  }
);

Given(
  "the role has file {string} with content:",
  async function (this: RoleXWorld, filePath: string, content: string) {
    this.roleFiles.set(filePath, content);
  }
);

// ============================================
// When steps
// ============================================

When("I load the role", async function (this: RoleXWorld) {
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");
  const { loadRole } = await import("rolexjs");

  try {
    // Parse locator
    const rxl = parseRXL(this.roleLocator!);

    // Create manifest
    const manifest = createRXM({
      domain: rxl.domain ?? "localhost",
      name: rxl.name,
      type: "role",
      version: rxl.version ?? "1.0.0",
    });

    // Create content from role files
    const filesObject: Record<string, string> = {};
    for (const [path, content] of this.roleFiles) {
      filesObject[path] = content;
    }
    const rxc = await createRXC(filesObject);

    // Create RXR
    const rxr = {
      locator: rxl,
      manifest,
      content: rxc,
    };

    // Link to registry (needed for ARP resolution)
    await this.registry!.link(rxr);

    // Load role
    this.currentRxr = rxr;
    this.renderedRole = await loadRole(rxr, this.registry!);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

When("I try to load the role", async function (this: RoleXWorld) {
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");
  const { loadRole } = await import("rolexjs");

  try {
    // Parse locator
    const rxl = parseRXL(this.roleLocator!);

    // Create manifest
    const manifest = createRXM({
      domain: rxl.domain ?? "localhost",
      name: rxl.name,
      type: "role",
      version: rxl.version ?? "1.0.0",
    });

    // Create content from role files
    const filesObject: Record<string, string> = {};
    for (const [path, content] of this.roleFiles) {
      filesObject[path] = content;
    }

    // Handle empty files case
    if (Object.keys(filesObject).length === 0) {
      filesObject["readme.md"] = "empty";
    }

    const rxc = await createRXC(filesObject);

    // Create RXR
    const rxr = {
      locator: rxl,
      manifest,
      content: rxc,
    };

    // Link to registry
    await this.registry!.link(rxr);

    // Load role
    this.currentRxr = rxr;
    this.renderedRole = await loadRole(rxr, this.registry!);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

// ============================================
// Then steps
// ============================================

Then("the role should be loaded successfully", function (this: RoleXWorld) {
  assert.ok(!this.error, `Role loading failed: ${this.error?.message}`);
  assert.ok(this.renderedRole, "RenderedRole should exist");
});

Then("the rendered prompt should contain {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(this.renderedRole, "RenderedRole should exist");
  assert.ok(
    this.renderedRole.prompt.includes(expected),
    `Prompt should contain "${expected}", got: ${this.renderedRole.prompt}`
  );
});

Then("the personality should contain {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(this.renderedRole, "RenderedRole should exist");
  assert.ok(
    this.renderedRole.personality.includes(expected),
    `Personality should contain "${expected}", got: ${this.renderedRole.personality}`
  );
});

Then("the principle should contain {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(this.renderedRole, "RenderedRole should exist");
  assert.ok(
    this.renderedRole.principle.includes(expected),
    `Principle should contain "${expected}", got: ${this.renderedRole.principle}`
  );
});

Then("the knowledge should contain {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(this.renderedRole, "RenderedRole should exist");
  assert.ok(
    this.renderedRole.knowledge.includes(expected),
    `Knowledge should contain "${expected}", got: ${this.renderedRole.knowledge}`
  );
});

Then("it should fail with error {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(this.error, "Expected an error to be thrown");
  assert.ok(
    this.error.message.includes(expected),
    `Error message should include "${expected}", got: ${this.error.message}`
  );
});

Then(
  "it should fail with error containing {string}",
  function (this: RoleXWorld, expected: string) {
    assert.ok(this.error, "Expected an error to be thrown");
    assert.ok(
      this.error.message.toLowerCase().includes(expected.toLowerCase()),
      `Error message should contain "${expected}", got: ${this.error.message}`
    );
  }
);
