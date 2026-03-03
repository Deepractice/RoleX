/**
 * MCP step definitions — tool listing, tool calls, result assertions.
 */

import { strict as assert } from "node:assert";
import { type DataTable, Given, Then, When } from "@deepracticex/bdd";
import type { BddWorld } from "../support/world";

// ===== Setup =====

Given("the MCP server is running", async function (this: BddWorld) {
  await this.connect();
});

Given("the MCP server is running via npx", async function (this: BddWorld) {
  await this.connectNpx();
});

// ===== Tool listing =====

Then("the following tools should be available:", async function (this: BddWorld, table: DataTable) {
  const { tools } = await this.client.listTools();
  const names = tools.map((t) => t.name);
  const expected = table.rows().map((row) => row[0]);

  for (const name of expected) {
    assert.ok(names.includes(name), `Tool "${name}" not found. Available: ${names.join(", ")}`);
  }
});

// ===== Tool calls =====

When(
  "I call tool {string} with:",
  async function (this: BddWorld, toolName: string, table: DataTable) {
    try {
      this.error = undefined;
      const args = table.rowsHash();
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });
      const content = result.content as Array<{ type: string; text: string }>;
      this.toolResult = content.map((c) => c.text).join("\n");
    } catch (e) {
      this.error = e as Error;
      this.toolResult = undefined;
    }
  }
);

// ===== Result assertions =====

Then("the tool result should contain {string}", function (this: BddWorld, text: string) {
  assert.ok(this.toolResult, "Expected a tool result but got none");
  assert.ok(
    this.toolResult.includes(text),
    `Expected result to contain "${text}" but got:\n${this.toolResult.slice(0, 500)}`
  );
});
