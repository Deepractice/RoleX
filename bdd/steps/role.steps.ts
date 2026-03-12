/**
 * Role API steps — operate through the Role handle (activate → want → plan → ...).
 *
 * Role methods return rendered 3-layer text (status + hint + projection).
 * Assertions check string content, not object properties.
 *
 * Note: Given/When/Then are interchangeable for matching — register each pattern once.
 */

import { strict as assert } from "node:assert";
import { Given, Then, When } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Activate =====

Given("I activate role {string}", async function (this: BddWorld, id: string) {
  this.role = await this.rolex!.role.activate({ individual: id });
});

// ===== Execution =====

Given(
  "I want goal {string} with {string}",
  async function (this: BddWorld, id: string, content: string) {
    this.toolResult = await this.role!.want(content, id);
  }
);

Given(
  "I plan {string} with {string}",
  async function (this: BddWorld, id: string, content: string) {
    this.toolResult = await this.role!.plan(content, id);
  }
);

Given(
  "I todo {string} with {string}",
  async function (this: BddWorld, id: string, content: string) {
    this.toolResult = await this.role!.todo(content, id);
  }
);

// ===== Finish =====

Given(
  "I finish {string} with encounter {string}",
  async function (this: BddWorld, taskId: string, encounter: string) {
    this.toolResult = await this.role!.finish(taskId, encounter);
  }
);

When("I finish {string} without encounter", async function (this: BddWorld, taskId: string) {
  this.toolResult = await this.role!.finish(taskId);
});

// ===== Complete / Abandon =====

When(
  "I complete plan {string} with encounter {string}",
  async function (this: BddWorld, planId: string, encounter: string) {
    this.toolResult = await this.role!.complete(planId, encounter);
  }
);

When(
  "I abandon plan {string} with encounter {string}",
  async function (this: BddWorld, planId: string, encounter: string) {
    this.toolResult = await this.role!.abandon(planId, encounter);
  }
);

// ===== Focus =====

When("I focus on {string}", async function (this: BddWorld, goalId: string) {
  this.toolResult = await this.role!.focus(goalId);
});

// ===== Cognition: Reflect =====

Given(
  "I reflect on {string} as {string} with {string}",
  async function (this: BddWorld, encounterId: string, expId: string, content: string) {
    this.toolResult = await this.role!.reflect([encounterId], content, expId);
  }
);

When(
  "I reflect directly as {string} with {string}",
  async function (this: BddWorld, expId: string, content: string) {
    this.toolResult = await this.role!.reflect([], content, expId);
  }
);

// ===== Cognition: Realize =====

Given(
  "I realize from {string} as {string} with {string}",
  async function (this: BddWorld, expId: string, principleId: string, content: string) {
    this.toolResult = await this.role!.realize([expId], content, principleId);
  }
);

When(
  "I realize directly as {string} with {string}",
  async function (this: BddWorld, principleId: string, content: string) {
    this.toolResult = await this.role!.realize([], content, principleId);
  }
);

// ===== Cognition: Master =====

Given(
  "I master from {string} as {string} with {string}",
  async function (this: BddWorld, expId: string, procId: string, content: string) {
    this.toolResult = await this.role!.master(content, procId, [expId]);
  }
);

When(
  "I master directly as {string} with {string}",
  async function (this: BddWorld, procId: string, content: string) {
    this.toolResult = await this.role!.master(content, procId);
  }
);

// ===== Knowledge management =====

When("I forget {string}", async function (this: BddWorld, nodeId: string) {
  this.toolResult = await this.role!.forget(nodeId);
});

// ===== Output assertions =====

Then("the output should contain {string}", function (this: BddWorld, text: string) {
  assert.ok(this.toolResult, "No output captured");
  assert.ok(
    this.toolResult.includes(text),
    `Expected output to contain "${text}" but got:\n${this.toolResult.slice(0, 500)}`
  );
});

// ===== Context assertions =====

Then("focusedPlanId should be {string}", function (this: BddWorld, planId: string) {
  assert.ok(this.role, "No active role");
  assert.equal(this.role.snapshot().focusedPlanId, planId);
});

Then("focusedPlanId should be null", function (this: BddWorld) {
  assert.ok(this.role, "No active role");
  assert.equal(this.role.snapshot().focusedPlanId, null);
});

Then("encounter {string} should be registered", function (this: BddWorld, encounterId: string) {
  assert.ok(this.role, "No active role");
  const snap = this.role.snapshot();
  assert.ok(
    snap.encounterIds.includes(encounterId),
    `Encounter "${encounterId}" not registered. Have: ${snap.encounterIds.join(", ")}`
  );
});

Then("encounter {string} should be consumed", function (this: BddWorld, encounterId: string) {
  assert.ok(this.role, "No active role");
  assert.ok(
    !this.role.snapshot().encounterIds.includes(encounterId),
    `Encounter "${encounterId}" should be consumed but is still registered`
  );
});

Then("encounter count should be {int}", function (this: BddWorld, count: number) {
  assert.ok(this.role, "No active role");
  assert.equal(this.role.snapshot().encounterIds.length, count);
});

Then("experience {string} should be registered", function (this: BddWorld, expId: string) {
  assert.ok(this.role, "No active role");
  const snap = this.role.snapshot();
  assert.ok(
    snap.experienceIds.includes(expId),
    `Experience "${expId}" not registered. Have: ${snap.experienceIds.join(", ")}`
  );
});

Then("experience {string} should be consumed", function (this: BddWorld, expId: string) {
  assert.ok(this.role, "No active role");
  assert.ok(
    !this.role.snapshot().experienceIds.includes(expId),
    `Experience "${expId}" should be consumed but is still registered`
  );
});

Then("experience count should be {int}", function (this: BddWorld, count: number) {
  assert.ok(this.role, "No active role");
  assert.equal(this.role.snapshot().experienceIds.length, count);
});
