/**
 * Resource Resolution Step Definitions
 * BDD steps for ARP resource resolution feature
 * @rolexjs/bdd
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { RoleXWorld } from "../support/world.js";

// ============================================
// Given steps
// ============================================

Given(
  "a local file {string} with content:",
  async function (this: RoleXWorld, filePath: string, content: string) {
    const fullPath = join(this.testDir, filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf-8");
  }
);

Given(
  "the resource has file {string} with content:",
  async function (this: RoleXWorld, filePath: string, content: string) {
    this.roleFiles.set(filePath, content);
  }
);

// ============================================
// When steps
// ============================================

When("I resolve {string}", async function (this: RoleXWorld, arpUrl: string) {
  const { createResourceResolver } = await import("rolexjs");
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");

  try {
    // First, ensure any referenced resources are linked to registry
    if (this.roleLocator && this.roleFiles.size > 0) {
      const rxl = parseRXL(this.roleLocator);
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
    }

    // Create resolver and resolve
    const resolver = createResourceResolver(this.registry!);
    this.resolvedContent = await resolver(arpUrl);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
    this.resolvedContent = null;
  }
});

When("I try to resolve {string}", async function (this: RoleXWorld, arpUrl: string) {
  const { createResourceResolver } = await import("rolexjs");

  try {
    const resolver = createResourceResolver(this.registry!);
    this.resolvedContent = await resolver(arpUrl);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
    this.resolvedContent = null;
  }
});

When("I load the role {string}", async function (this: RoleXWorld, locator: string) {
  const { loadRole } = await import("rolexjs");
  const { createRXM, createRXC, parseRXL } = await import("resourcexjs");

  try {
    // Link current resource if exists (for cross-resource scenarios)
    if (this.roleLocator && this.roleFiles.size > 0) {
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

    // Get RXR from registry
    const rxl = parseRXL(locator);
    const resolved = await this.registry!.resolve(rxl.toString());
    const rxr = resolved.resource;

    this.renderedRole = await loadRole(rxr, this.registry!);
    this.error = null;
  } catch (e) {
    this.error = e as Error;
  }
});

// ============================================
// Then steps
// ============================================

Then("the content should be:", function (this: RoleXWorld, expected: string) {
  assert.ok(!this.error, `Resolution failed: ${this.error?.message}`);
  assert.ok(this.resolvedContent, "Resolved content should exist");
  assert.equal(this.resolvedContent.trim(), expected.trim());
});

Then("the content should contain {string}", function (this: RoleXWorld, expected: string) {
  assert.ok(!this.error, `Resolution failed: ${this.error?.message}`);
  assert.ok(this.resolvedContent, "Resolved content should exist");
  assert.ok(
    this.resolvedContent.includes(expected),
    `Content should contain "${expected}", got: ${this.resolvedContent}`
  );
});
