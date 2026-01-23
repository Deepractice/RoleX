/**
 * Cucumber Hooks
 * Setup and teardown for BDD tests
 * @rolexjs/bdd
 */

import { Before, After } from "@cucumber/cucumber";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import type { RoleXWorld } from "./world.js";

const TEST_BASE_DIR = join(process.cwd(), ".test-bdd-rolex");

Before(async function (this: RoleXWorld) {
  // Generate unique test directory for each scenario
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  this.testDir = join(TEST_BASE_DIR, `test-${timestamp}-${random}`);

  // Create test directory
  await mkdir(this.testDir, { recursive: true });

  // Reset state
  this.registry = null;
  this.roleFiles = new Map();
  this.roleLocator = null;
  this.currentRxr = null;
  this.renderedRole = null;
  this.resolvedResource = null;
  this.resolvedContent = null;
  this.serializedBuffer = null;
  this.error = null;
});

After(async function (this: RoleXWorld) {
  // Clean up test directory
  try {
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});
