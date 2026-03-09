/**
 * Steps for context persistence tests — operate at the Rolex API level.
 */

import { strict as assert } from "node:assert";
import { Given, Then, When } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Setup =====

Given("a fresh Rolex instance", async function (this: BddWorld) {
  await this.initRolex();
});

Given(
  "an individual {string} with goal {string}",
  async function (this: BddWorld, name: string, goalId: string) {
    await this.rolex.direct("!society.born", { content: `Feature: ${name}`, id: name });
    await this.rolex.direct("!role.want", {
      individual: name,
      goal: `Feature: ${goalId}`,
      id: goalId,
    });
  }
);

Given(
  "an individual {string} with goals {string} and {string}",
  async function (this: BddWorld, name: string, goal1: string, goal2: string) {
    await this.rolex.direct("!society.born", { content: `Feature: ${name}`, id: name });
    await this.rolex.direct("!role.want", {
      individual: name,
      goal: `Feature: ${goal1}`,
      id: goal1,
    });
    await this.rolex.direct("!role.want", {
      individual: name,
      goal: `Feature: ${goal2}`,
      id: goal2,
    });
  }
);

// ===== Persistence setup =====

Given("persisted focusedGoalId is null", async function (this: BddWorld) {
  await this.writeContext("sean", { focusedGoalId: null, focusedPlanId: null });
  await this.newSession();
});

Given("persisted focusedGoalId is {string}", async function (this: BddWorld, goalId: string) {
  await this.writeContext("sean", { focusedGoalId: goalId, focusedPlanId: null });
  await this.newSession();
});

Given("no persisted context exists", async function (this: BddWorld) {
  // Don't write any context file — just create a new session
  await this.newSession();
});

// ===== Actions =====

When("I activate {string}", async function (this: BddWorld, name: string) {
  try {
    this.error = undefined;
    this.role = await this.rolex.activate(name);
  } catch (e) {
    this.error = e as Error;
    this.role = undefined;
  }
});

// ===== Assertions =====

Then("focusedGoalId should be {string}", function (this: BddWorld, goalId: string) {
  assert.ok(this.role, "Expected a role but activation failed");
  assert.equal(
    this.role.snapshot().focusedGoalId,
    goalId,
    `Expected focusedGoalId to be "${goalId}" but got "${this.role.snapshot().focusedGoalId}"`
  );
});
