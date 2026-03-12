/**
 * Direct steps — call rolex builder API for system-level operations.
 */

import { strict as assert } from "node:assert";
import { type DataTable, Given, Then, When } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Setup helpers =====

Given("individual {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.society.born({ content: `Feature: ${id}`, id });
});

Given("individual {string} is retired", async function (this: BddWorld, id: string) {
  await this.rolex!.society.retire({ individual: id });
});

Given("organization {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.society.found({ content: `Feature: ${id}`, id });
});

Given("position {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.org.establish({ content: `Feature: ${id}`, id });
});

Given(
  "{string} is hired into {string}",
  async function (this: BddWorld, individual: string, org: string) {
    await this.rolex!.org.hire({ org, individual });
  }
);

Given(
  "{string} is appointed to {string}",
  async function (this: BddWorld, individual: string, position: string) {
    await this.rolex!.position.appoint({ position, individual });
  }
);

Given("project {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.org.launch({ content: `Feature: ${id}`, id });
});

Given(
  "milestone {string} exists in project {string}",
  async function (this: BddWorld, milestone: string, project: string) {
    await this.rolex!.project.milestone({
      project,
      content: `Feature: ${milestone}`,
      id: milestone,
    });
  }
);

Given(
  "{string} is enrolled in {string}",
  async function (this: BddWorld, individual: string, project: string) {
    await this.rolex!.project.enroll({ project, individual });
  }
);

// ===== Direct call =====

When("I direct {string} with:", async function (this: BddWorld, command: string, table: DataTable) {
  try {
    this.error = undefined;
    const args = table.rowsHash();
    const method = command.startsWith("!") ? command.slice(1) : command;
    const response = await this.rolex!.rpc({ jsonrpc: "2.0", method, params: args, id: null });
    if (response.error) {
      throw new Error(response.error.message);
    }
    const raw = response.result;
    // Store both raw result and serialized form
    this.directRaw = raw as any;
    this.directResult = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
  } catch (e) {
    this.error = e as Error;
    this.directRaw = undefined;
    this.directResult = undefined;
  }
});

// ===== Result assertions =====

Then("the result process should be {string}", function (this: BddWorld, process: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(
    this.directRaw.process,
    process,
    `Expected process "${process}" but got "${this.directRaw.process}"`
  );
});

Then("the result state name should be {string}", function (this: BddWorld, name: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(
    this.directRaw.state.name,
    name,
    `Expected state name "${name}" but got "${this.directRaw.state.name}"`
  );
});

Then("the result state id should be {string}", function (this: BddWorld, id: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(
    this.directRaw.state.id,
    id,
    `Expected state id "${id}" but got "${this.directRaw.state.id}"`
  );
});

Then("the direct result should contain {string}", function (this: BddWorld, text: string) {
  assert.ok(this.directResult, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.ok(
    this.directResult.toLowerCase().includes(text.toLowerCase()),
    `Expected result to contain "${text}" but got:\n${this.directResult.slice(0, 500)}`
  );
});

Then(
  "the result state should have link {string} to {string}",
  function (this: BddWorld, relation: string, targetId: string) {
    assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
    const links = this.directRaw.state.links ?? [];
    const found = links.some((l: any) => l.relation === relation && l.target.id === targetId);
    assert.ok(
      found,
      `Expected link "${relation}" to "${targetId}" but got: ${JSON.stringify(links.map((l: any) => `${l.relation} → ${l.target.id}`))}`
    );
  }
);

Then("it should fail", function (this: BddWorld) {
  assert.ok(this.error, "Expected an error but operation succeeded");
});

// ===== Entity existence assertions =====

Then("individual {string} should exist", async function (this: BddWorld, id: string) {
  const result = await this.rolex!.census.list({ type: "individual" });
  const ids = (result.state.children ?? []).map((c: any) => c.id);
  assert.ok(ids.includes(id), `Individual "${id}" not found in census: ${JSON.stringify(ids)}`);
});

Then("organization {string} should exist", async function (this: BddWorld, id: string) {
  const result = await this.rolex!.census.list({ type: "organization" });
  const ids = (result.state.children ?? []).map((c: any) => c.id);
  assert.ok(ids.includes(id), `Organization "${id}" not found in census: ${JSON.stringify(ids)}`);
});
