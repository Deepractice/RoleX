/**
 * Prototype migration steps — test migration settle flow via Rolex RPC API.
 */

import { strict as assert } from "node:assert";
import { type DataTable, Given, Then, When } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Setup: create in-memory prototype with migrations =====

Given(
  "a prototype {string} with migrations:",
  async function (this: BddWorld, protoId: string, table: DataTable) {
    const rows = table.hashes(); // [{ file, ops }]
    const migrations: Array<{ file: string; ops: unknown[] }> = rows.map((row) => ({
      file: row.file,
      ops: JSON.parse(row.ops),
    }));
    // Store on world for later use
    this.protoMigrations = this.protoMigrations ?? {};
    this.protoMigrations[protoId] = migrations;
  }
);

Given(
  "prototype {string} has been settled at V{int}",
  async function (this: BddWorld, protoId: string, version: number) {
    // Execute settle up to the given version
    const migrations = this.protoMigrations?.[protoId];
    assert.ok(migrations, `No migrations defined for "${protoId}"`);

    const upToVersion = migrations
      .filter((m) => {
        const v = parseInt(m.file.match(/^V(\d+)__/)?.[1] ?? "0", 10);
        return v <= version;
      })
      .sort((a, b) => {
        const va = parseInt(a.file.match(/^V(\d+)__/)?.[1] ?? "0", 10);
        const vb = parseInt(b.file.match(/^V(\d+)__/)?.[1] ?? "0", 10);
        return va - vb;
      });

    for (const m of upToVersion) {
      for (const op of m.ops as Array<{ op: string; args: Record<string, unknown> }>) {
        const method = op.op.startsWith("!") ? op.op.slice(1) : op.op;
        await this.rolex!.rpc({
          jsonrpc: "2.0",
          method,
          params: op.args,
          id: null,
        });
      }
      // Record migration as executed
      const migrationId = m.file.replace(/\.json$/, "");
      await this.rolex!.rpc({
        jsonrpc: "2.0",
        method: "prototype.record-migration",
        params: { prototypeId: protoId, migrationId },
        id: null,
      });
    }
  }
);

// ===== Actions =====

When("I settle prototype {string}", async function (this: BddWorld, protoId: string) {
  try {
    this.error = undefined;
    const migrations = this.protoMigrations?.[protoId];
    assert.ok(migrations, `No migrations defined for "${protoId}"`);

    const response = await this.rolex!.rpc({
      jsonrpc: "2.0",
      method: "prototype.settle-migrations",
      params: { prototypeId: protoId, migrations: JSON.stringify(migrations) },
      id: null,
    });
    this.settleResult = response.result as string;
  } catch (e) {
    this.error = e as Error;
  }
});

// ===== Assertions =====

Then(
  "migration {string} of {string} should be recorded",
  async function (this: BddWorld, migrationId: string, protoId: string) {
    const response = await this.rolex!.rpc({
      jsonrpc: "2.0",
      method: "prototype.migration-history",
      params: { prototypeId: protoId },
      id: null,
    });
    const history = response.result;
    const found = Array.isArray(history)
      ? history.some((h: any) => h.migration_id === migrationId)
      : String(history).includes(migrationId);
    assert.ok(found, `Migration "${migrationId}" not found in history for "${protoId}"`);
  }
);

Then(
  "migration count of {string} should be {int}",
  async function (this: BddWorld, protoId: string, count: number) {
    const response = await this.rolex!.rpc({
      jsonrpc: "2.0",
      method: "prototype.migration-history",
      params: { prototypeId: protoId },
      id: null,
    });
    const history = response.result;
    const actual = Array.isArray(history) ? history.length : 0;
    assert.equal(actual, count, `Expected ${count} migrations but got ${actual}`);
  }
);

Then("the settle result should contain {string}", function (this: BddWorld, text: string) {
  const result = this.settleResult ?? "";
  assert.ok(
    result.toLowerCase().includes(text.toLowerCase()),
    `Expected settle result to contain "${text}" but got: ${result}`
  );
});
