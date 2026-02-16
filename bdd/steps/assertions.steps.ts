/**
 * All Then/assertion steps — shared across features and journeys.
 */

import { strict as assert } from "node:assert";
import { Then } from "@deepractice/bdd";
import type { RoleXWorld } from "../support/world";

// ========== Result Assertions ==========

Then("the result should contain {string}", function (this: RoleXWorld, text: string) {
  assert.ok(this.result, "Expected a result but got none (error occurred?)");
  assert.ok(
    this.result.includes(text),
    `Expected result to contain "${text}" but got:\n${this.result}`
  );
});

Then("it should fail with {string}", function (this: RoleXWorld, text: string) {
  assert.ok(this.error, `Expected an error containing "${text}" but no error occurred`);
  assert.ok(
    this.error.message.includes(text),
    `Expected error to contain "${text}" but got: ${this.error.message}`
  );
});

// ========== Role Assertions ==========

Then("role {string} should exist", function (this: RoleXWorld, name: string) {
  assert.ok(this.graph.hasNode(name), `Role "${name}" should exist`);
  assert.equal(this.graph.getNode(name)?.type, "role");
});

Then("role {string} should not exist", function (this: RoleXWorld, name: string) {
  assert.ok(!this.graph.hasNode(name), `Role "${name}" should not exist`);
});

Then(
  "role {string} should have a persona containing {string}",
  function (this: RoleXWorld, name: string, text: string) {
    const content = this.platform.readContent(`${name}/persona`);
    assert.ok(content, `Persona for "${name}" not found`);
    const source = `${content.name} ${content.description ?? ""}`;
    assert.ok(source.includes(text), `Persona should contain "${text}"`);
  }
);

Then(
  /^role "([^"]*)" should have knowledge\.pattern "([^"]*)"$/,
  function (this: RoleXWorld, role: string, name: string) {
    assert.ok(this.graph.hasNode(`${role}/${name}`), `knowledge.pattern "${name}" not found`);
    assert.equal(this.graph.getNode(`${role}/${name}`)?.type, "knowledge.pattern");
  }
);

Then(
  /^role "([^"]*)" should have knowledge\.procedure "([^"]*)"$/,
  function (this: RoleXWorld, role: string, name: string) {
    assert.ok(this.graph.hasNode(`${role}/${name}`), `knowledge.procedure "${name}" not found`);
    assert.equal(this.graph.getNode(`${role}/${name}`)?.type, "knowledge.procedure");
  }
);

Then("role {string} should be shadowed", function (this: RoleXWorld, name: string) {
  assert.ok(this.graph.getNode(name)?.shadow, `Role "${name}" should be shadowed`);
});

Then("persona of {string} should be tagged @retired", function (this: RoleXWorld, name: string) {
  const content = this.platform.readContent(`${name}/persona`);
  assert.ok(content, `Persona for "${name}" not found`);
  const hasRetired = content.tags?.some((t: any) => t.name === "@retired");
  assert.ok(hasRetired, `Persona should have @retired tag`);
});

// ========== Goal Assertions ==========

Then("goal {string} should exist", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  assert.ok(this.graph.hasNode(`${roleKey}/${name}`), `Goal "${name}" not found`);
});

Then("focus should be on {string}", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const focus = this.graph.getNode(roleKey!)?.state?.focus;
  assert.ok(focus?.endsWith(`/${name}`), `Focus should be on "${name}" but is "${focus}"`);
});

Then("goal {string} should be marked @done", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const content = this.platform.readContent(`${roleKey}/${name}`);
  assert.ok(content, `Goal "${name}" content not found`);
  const hasDone = content.tags?.some((t: any) => t.name === "@done");
  assert.ok(hasDone, `Goal "${name}" should have @done tag`);
});

Then("goal {string} should be marked @abandoned", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  // abandon() shadows the goal (cascading to plans/tasks)
  const node = this.graph.getNode(`${roleKey}/${name}`);
  assert.ok(node, `Goal "${name}" not found in graph`);
  assert.ok(node.shadow, `Goal "${name}" should be shadowed (abandoned)`);
});

// ========== Plan Assertions ==========

Then(
  "plan {string} should exist under goal {string}",
  function (this: RoleXWorld, plan: string, goal: string) {
    const roleKey = this.individualSystem.ctx?.structure;
    const plans = this.graph.outNeighbors(`${roleKey}/${goal}`, "has-plan");
    const found = plans.some((k) => k.endsWith(`/${plan}`));
    assert.ok(found, `Plan "${plan}" not found under goal "${goal}"`);
  }
);

Then("focused plan should be {string}", function (this: RoleXWorld, plan: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const focus = this.graph.getNode(roleKey!)?.state?.focus;
  const goalNode = this.graph.getNode(focus!);
  const focusPlan = goalNode?.state?.focusPlan;
  assert.ok(
    focusPlan?.endsWith(`/${plan}`),
    `Focused plan should be "${plan}" but is "${focusPlan}"`
  );
});

// ========== Task Assertions ==========

Then(
  "task {string} should exist under plan {string}",
  function (this: RoleXWorld, task: string, plan: string) {
    const roleKey = this.individualSystem.ctx?.structure;
    const tasks = this.graph.outNeighbors(`${roleKey}/${plan}`, "has-task");
    const found = tasks.some((k) => k.endsWith(`/${task}`));
    assert.ok(found, `Task "${task}" not found under plan "${plan}"`);
  }
);

Then("task {string} should be marked @done", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const content = this.platform.readContent(`${roleKey}/${name}`);
  assert.ok(content, `Task "${name}" content not found`);
  const hasDone = content.tags?.some((t: any) => t.name === "@done");
  assert.ok(hasDone, `Task "${name}" should have @done tag`);
});

// ========== Experience & Knowledge Assertions ==========

Then("conclusion {string} should exist", function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  assert.ok(this.graph.hasNode(`${roleKey}/${name}-conclusion`), `Conclusion "${name}" not found`);
});

Then(/^experience\.insight "([^"]*)" should exist$/, function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  assert.ok(this.graph.hasNode(`${roleKey}/${name}`), `Insight "${name}" not found`);
  assert.equal(this.graph.getNode(`${roleKey}/${name}`)?.type, "experience.insight");
  assert.ok(
    !this.graph.getNode(`${roleKey}/${name}`)?.shadow,
    `Insight "${name}" should not be shadowed`
  );
});

Then(
  /^experience\.insight "([^"]*)" should be consumed$/,
  function (this: RoleXWorld, name: string) {
    const roleKey = this.individualSystem.ctx?.structure;
    assert.ok(
      this.graph.getNode(`${roleKey}/${name}`)?.shadow,
      `Insight "${name}" should be consumed (shadowed)`
    );
  }
);

Then(/^experience\.insight "([^"]*)" should not exist$/, function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const node = this.graph.getNode(`${roleKey}/${name}`);
  assert.ok(!node || node.shadow, `Insight "${name}" should not exist`);
});

Then("conclusions should be consumed", function (this: RoleXWorld) {
  // All conclusion nodes should be shadowed
  const roleKey = this.individualSystem.ctx?.structure;
  const nodes = this.graph.findNodes(
    (key, attrs) =>
      key.startsWith(`${roleKey}/`) &&
      key.endsWith("-conclusion") &&
      attrs.type === "experience.conclusion"
  );
  for (const key of nodes) {
    const node = this.graph.getNode(key);
    assert.ok(node?.shadow, `Conclusion "${key}" should be consumed`);
  }
});

Then(/^knowledge\.pattern "([^"]*)" should exist$/, function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  assert.ok(this.graph.hasNode(`${roleKey}/${name}`), `Pattern "${name}" not found`);
  assert.equal(this.graph.getNode(`${roleKey}/${name}`)?.type, "knowledge.pattern");
});

Then(/^knowledge\.pattern "([^"]*)" should not exist$/, function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  const node = this.graph.getNode(`${roleKey}/${name}`);
  assert.ok(!node || node.shadow, `Pattern "${name}" should not exist`);
});

Then(
  /^knowledge\.pattern "([^"]*)" should still exist$/,
  function (this: RoleXWorld, name: string) {
    const roleKey = this.individualSystem.ctx?.structure;
    assert.ok(this.graph.hasNode(`${roleKey}/${name}`), `Pattern "${name}" not found`);
    assert.ok(
      !this.graph.getNode(`${roleKey}/${name}`)?.shadow,
      `Pattern "${name}" should not be shadowed`
    );
  }
);

Then(/^knowledge\.theory "([^"]*)" should exist$/, function (this: RoleXWorld, name: string) {
  const roleKey = this.individualSystem.ctx?.structure;
  assert.ok(this.graph.hasNode(`${roleKey}/${name}`), `Theory "${name}" not found`);
  assert.equal(this.graph.getNode(`${roleKey}/${name}`)?.type, "knowledge.theory");
});

// ========== Organization Assertions ==========

Then("org {string} should exist", function (this: RoleXWorld, name: string) {
  assert.ok(this.graph.hasNode(name), `Org "${name}" should exist`);
  assert.equal(this.graph.getNode(name)?.type, "organization");
});

Then(
  "org {string} should have charter containing {string}",
  function (this: RoleXWorld, name: string, text: string) {
    const content = this.platform.readContent(`${name}/charter`);
    assert.ok(content, `Charter for "${name}" not found`);
    // Check scenarios for the text
    const scenarioTexts = content.scenarios?.map((s: any) => JSON.stringify(s)).join(" ") ?? "";
    const featureText = `${content.name ?? ""} ${content.description ?? ""} ${scenarioTexts}`;
    assert.ok(featureText.includes(text), `Charter should contain "${text}"`);
  }
);

Then("org {string} should be shadowed", function (this: RoleXWorld, name: string) {
  assert.ok(this.graph.getNode(name)?.shadow, `Org "${name}" should be shadowed`);
});

// ========== Position Assertions ==========

Then(
  "position {string} should exist in {string}",
  function (this: RoleXWorld, position: string, org: string) {
    assert.ok(
      this.graph.hasNode(`${org}/${position}`),
      `Position "${position}" not found in "${org}"`
    );
    assert.equal(this.graph.getNode(`${org}/${position}`)?.type, "position");
  }
);

Then(
  "position {string} should be shadowed in {string}",
  function (this: RoleXWorld, position: string, org: string) {
    assert.ok(
      this.graph.getNode(`${org}/${position}`)?.shadow,
      `Position "${position}" should be shadowed`
    );
  }
);

Then(
  "charter {string} should exist in {string}",
  function (this: RoleXWorld, name: string, org: string) {
    assert.ok(
      this.graph.hasNode(`${org}/${name}`),
      `Charter entry "${name}" not found in "${org}"`
    );
  }
);

// ========== Membership & Assignment Assertions ==========

Then(
  "{string} should be a member of {string}",
  function (this: RoleXWorld, role: string, org: string) {
    assert.ok(this.graph.hasEdge(org, role), `"${role}" should be a member of "${org}"`);
  }
);

Then(
  "{string} should not be a member of {string}",
  function (this: RoleXWorld, role: string, org: string) {
    assert.ok(!this.graph.hasEdge(org, role), `"${role}" should NOT be a member of "${org}"`);
  }
);

Then(
  "{string} should be assigned to {string}",
  function (this: RoleXWorld, role: string, position: string) {
    assert.ok(this.graph.hasEdge(position, role), `"${role}" should be assigned to "${position}"`);
  }
);

Then(
  "{string} should not be assigned to {string}",
  function (this: RoleXWorld, role: string, position: string) {
    assert.ok(
      !this.graph.hasEdge(position, role),
      `"${role}" should NOT be assigned to "${position}"`
    );
  }
);
