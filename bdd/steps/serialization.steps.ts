/**
 * Role serialization steps — test snapshot/restore cycle.
 */

import { strict as assert } from "node:assert";
import { Then, When } from "@deepracticex/bdd";
import type { RoleSnapshot } from "@rolexjs/core";
import type { BddWorld } from "../support/world";

// Extend world to hold serialization state
declare module "../support/world" {
  interface BddWorld {
    roleSnapshot?: RoleSnapshot;
  }
}

// ===== Serialization =====

When("I serialize the role", function (this: BddWorld) {
  assert.ok(this.role, "No active role");
  this.roleSnapshot = this.role.snapshot();
});

When(
  "I restore the role from snapshot with fresh state projection",
  async function (this: BddWorld) {
    assert.ok(this.roleSnapshot, "No snapshot captured");
    // Simulate restore: new session + activate (which restores from persisted context)
    await this.newSession();
    this.role = await this.rolex!.activate(this.roleSnapshot.id);
  }
);

// ===== Snapshot assertions =====

Then(
  "the snapshot should contain focusedGoalId {string}",
  function (this: BddWorld, goalId: string) {
    assert.ok(this.roleSnapshot, "No snapshot captured");
    assert.equal(this.roleSnapshot.focusedGoalId, goalId);
  }
);

Then(
  "the snapshot should contain focusedPlanId {string}",
  function (this: BddWorld, planId: string) {
    assert.ok(this.roleSnapshot, "No snapshot captured");
    assert.equal(this.roleSnapshot.focusedPlanId, planId);
  }
);

Then(
  "the snapshot should contain encounter {string}",
  function (this: BddWorld, encounterId: string) {
    assert.ok(this.roleSnapshot, "No snapshot captured");
    assert.ok(
      this.roleSnapshot.encounterIds.includes(encounterId),
      `Expected snapshot to contain encounter "${encounterId}" but has: ${this.roleSnapshot.encounterIds.join(", ")}`
    );
  }
);

Then("focus without args should return {string}", async function (this: BddWorld, goalId: string) {
  assert.ok(this.role, "No active role");
  const output = await this.role.focus();
  assert.ok(
    output.includes(`(${goalId})`),
    `Expected focus to return "${goalId}" but got:\n${output.slice(0, 300)}`
  );
});
