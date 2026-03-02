/**
 * Direct steps — call rolex.direct() for system-level operations.
 */

import { strict as assert } from "node:assert";
import { type DataTable, Given, When, Then } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Setup helpers =====

Given("individual {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.direct("!individual.born", { content: `Feature: ${id}`, id });
});

Given("individual {string} is retired", async function (this: BddWorld, id: string) {
  await this.rolex!.direct("!individual.retire", { individual: id });
});

Given("organization {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.direct("!org.found", { content: `Feature: ${id}`, id });
});

Given("position {string} exists", async function (this: BddWorld, id: string) {
  await this.rolex!.direct("!position.establish", { content: `Feature: ${id}`, id });
});

Given(
  "{string} is hired into {string}",
  async function (this: BddWorld, individual: string, org: string) {
    await this.rolex!.direct("!org.hire", { org, individual });
  }
);

Given(
  "{string} is appointed to {string}",
  async function (this: BddWorld, individual: string, position: string) {
    await this.rolex!.direct("!position.appoint", { position, individual });
  }
);

// ===== Direct call =====

When(
  "I direct {string} with:",
  async function (this: BddWorld, command: string, table: DataTable) {
    try {
      this.error = undefined;
      const args = table.rowsHash();
      const raw = await this.rolex!.direct(command, args);
      // Store both raw result and serialized form
      this.directRaw = raw as any;
      this.directResult = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
    } catch (e) {
      this.error = e as Error;
      this.directRaw = undefined;
      this.directResult = undefined;
    }
  }
);

// ===== Result assertions =====

Then("the result process should be {string}", function (this: BddWorld, process: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(this.directRaw.process, process, `Expected process "${process}" but got "${this.directRaw.process}"`);
});

Then("the result state name should be {string}", function (this: BddWorld, name: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(this.directRaw.state.name, name, `Expected state name "${name}" but got "${this.directRaw.state.name}"`);
});

Then("the result state id should be {string}", function (this: BddWorld, id: string) {
  assert.ok(this.directRaw, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.equal(this.directRaw.state.id, id, `Expected state id "${id}" but got "${this.directRaw.state.id}"`);
});

Then("the direct result should contain {string}", function (this: BddWorld, text: string) {
  assert.ok(this.directResult, `Expected a result but got error: ${this.error?.message ?? "none"}`);
  assert.ok(
    this.directResult.toLowerCase().includes(text.toLowerCase()),
    `Expected result to contain "${text}" but got:\n${this.directResult.slice(0, 500)}`
  );
});

Then("it should fail", function (this: BddWorld) {
  assert.ok(this.error, "Expected an error but operation succeeded");
});

// ===== Entity existence assertions =====

Then("individual {string} should exist", async function (this: BddWorld, id: string) {
  const census = await this.rolex!.direct<string>("!census.list", { type: "individual" });
  assert.ok(census.includes(id), `Individual "${id}" not found in census: ${census}`);
});

Then("organization {string} should exist", async function (this: BddWorld, id: string) {
  const census = await this.rolex!.direct<string>("!census.list", { type: "organization" });
  assert.ok(census.includes(id), `Organization "${id}" not found in census: ${census}`);
});
