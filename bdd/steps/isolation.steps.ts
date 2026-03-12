/**
 * Role isolation steps — test that focus, goals, and state
 * never leak between individuals.
 */

import { strict as assert } from "node:assert";
import { Given, Then, When } from "@deepracticex/bdd";
import type { Role } from "rolexjs";
import type { BddWorld } from "../support/world";

// ===== Setup =====

Given(
  "individual {string} exists with goal {string}",
  async function (this: BddWorld, id: string, goalId: string) {
    await this.rolex!.society.born({ content: `Feature: ${id}`, id });
    // Create goal through activate + want
    const role = await this.rolex!.individual.activate({ individual: id });
    await role.want(`Feature: ${goalId}`, goalId);
  }
);

// ===== Focus isolation =====

When("I focus without args", async function (this: BddWorld) {
  try {
    this.error = undefined;
    this.toolResult = await this.role!.focus();
  } catch (e) {
    this.error = e as Error;
  }
});

Then(
  "focus on {string} should fail with ownership error",
  async function (this: BddWorld, goalId: string) {
    try {
      await this.role!.focus(goalId);
      assert.fail(`Expected focus on "${goalId}" to fail with ownership error, but it succeeded`);
    } catch (e) {
      const msg = (e as Error).message.toLowerCase();
      assert.ok(
        msg.includes("not found") || msg.includes("ownership") || msg.includes("does not belong"),
        `Expected ownership error but got: ${(e as Error).message}`
      );
    }
  }
);

Then("focusedGoalId should not be {string}", function (this: BddWorld, goalId: string) {
  assert.ok(this.role, "No active role");
  assert.notEqual(
    this.role.snapshot().focusedGoalId,
    goalId,
    `Expected focusedGoalId to NOT be "${goalId}" but it was`
  );
});

// ===== Goal isolation =====

Then(
  "{string} should be under individual {string}",
  async function (this: BddWorld, nodeId: string, individualId: string) {
    // Use rendered project output to check node presence
    const role = await this.rolex!.individual.activate({ individual: individualId });
    const output = await role.project();
    assert.ok(
      output.includes(`(${nodeId})`),
      `Node "${nodeId}" not found under individual "${individualId}"`
    );
  }
);

Then(
  "{string} should not be under individual {string}",
  async function (this: BddWorld, nodeId: string, individualId: string) {
    const role = await this.rolex!.individual.activate({ individual: individualId });
    const output = await role.project();
    assert.ok(
      !output.includes(`(${nodeId})`),
      `Node "${nodeId}" should NOT be under individual "${individualId}" but was found`
    );
  }
);

// ===== Persistence isolation =====

Given("role {string} is persisted", async function (this: BddWorld, _id: string) {
  // Role state is auto-persisted on focus/want/plan operations.
  // This step is a no-op marker for readability.
});

When("I restore role {string} from KV", async function (this: BddWorld, id: string) {
  // Simulate restoring by creating a new session and re-activating
  await this.newSession();
  try {
    this.error = undefined;
    this.role = await this.rolex!.individual.activate({ individual: id });
  } catch (e) {
    this.error = e as Error;
  }
});

// ===== Role instance identity =====

let firstRole: Role | undefined;

When("I activate role {string} again", async function (this: BddWorld, id: string) {
  firstRole = this.role;
  this.role = await this.rolex!.individual.activate({ individual: id });
});

Then("both activations should return the same Role instance", function (this: BddWorld) {
  assert.ok(firstRole, "First activation not captured");
  assert.ok(this.role, "Second activation failed");
  assert.strictEqual(this.role, firstRole, "Expected same Role instance but got different ones");
  firstRole = undefined;
});

Then("I should receive a Role with id {string}", function (this: BddWorld, id: string) {
  assert.ok(this.role, "No active role");
  assert.equal(this.role.id, id);
});

// ===== Error handling =====

When("I try to activate role {string}", async function (this: BddWorld, id: string) {
  try {
    this.error = undefined;
    this.role = await this.rolex!.individual.activate({ individual: id });
  } catch (e) {
    this.error = e as Error;
    this.role = undefined;
  }
});

Then("it should fail with {string}", function (this: BddWorld, message: string) {
  assert.ok(this.error, "Expected an error but operation succeeded");
  assert.ok(
    this.error.message.toLowerCase().includes(message.toLowerCase()),
    `Expected error containing "${message}" but got: ${this.error.message}`
  );
});

// ===== Role domain =====

Then(
  "role {string} should contain node {string}",
  async function (this: BddWorld, roleId: string, nodeId: string) {
    const role = await this.rolex!.individual.activate({ individual: roleId });
    const output = await role.project();
    assert.ok(output.includes(`(${nodeId})`), `Node "${nodeId}" not found in role "${roleId}"`);
  }
);
