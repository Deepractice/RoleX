/**
 * Individual System steps — identity, want, focus, explore, design, todo,
 * finish, achieve, abandon, reflect, contemplate, forget.
 */

import { When } from "@deepractice/bdd";
import type { RoleXWorld } from "../support/world";

// ===== identity =====

When("I call identity for {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "identity", { roleId: name });
});

// ===== want =====

When("I want {string} with:", async function (this: RoleXWorld, name: string, source: string) {
  await this.run(this.individualSystem, "want", { name, source });
});

// ===== focus =====

When("I call focus", async function (this: RoleXWorld) {
  await this.run(this.individualSystem, "focus", {});
});

When("I call focus with name {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "focus", { name });
});

// ===== explore =====

When("I call explore", async function (this: RoleXWorld) {
  await this.run(this.individualSystem, "explore", {});
});

When("I call explore with name {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "explore", { name });
});

// ===== design =====

When("I design {string} with:", async function (this: RoleXWorld, name: string, source: string) {
  await this.run(this.individualSystem, "design", { name, source });
});

// ===== todo =====

When("I todo {string} with:", async function (this: RoleXWorld, name: string, source: string) {
  await this.run(this.individualSystem, "todo", { name, source });
});

// ===== finish =====

When("I finish {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "finish", { name });
});

When(
  "I finish {string} with conclusion:",
  async function (this: RoleXWorld, name: string, conclusion: string) {
    await this.run(this.individualSystem, "finish", { name, conclusion });
  }
);

// ===== achieve =====

When(
  "I achieve with experience {string}:",
  async function (this: RoleXWorld, name: string, source: string) {
    await this.run(this.individualSystem, "achieve", {
      experience: { name, source },
    });
  }
);

// ===== abandon =====

When("I abandon", async function (this: RoleXWorld) {
  await this.run(this.individualSystem, "abandon", {});
});

When(
  "I abandon with experience {string}:",
  async function (this: RoleXWorld, name: string, source: string) {
    await this.run(this.individualSystem, "abandon", {
      experience: { name, source },
    });
  }
);

// ===== reflect =====

// Single insight
When(
  /^I reflect on "([^"]*)" to produce "([^"]*)" with:$/,
  async function (this: RoleXWorld, insight: string, knowledgeName: string, source: string) {
    await this.run(this.individualSystem, "reflect", {
      experienceNames: [insight],
      knowledgeName,
      knowledgeSource: source,
    });
  }
);

// Two insights (comma-separated)
When(
  /^I reflect on "([^"]*)", "([^"]*)" to produce "([^"]*)" with:$/,
  async function (
    this: RoleXWorld,
    insight1: string,
    insight2: string,
    knowledgeName: string,
    source: string
  ) {
    await this.run(this.individualSystem, "reflect", {
      experienceNames: [insight1, insight2],
      knowledgeName,
      knowledgeSource: source,
    });
  }
);

// ===== contemplate =====

When(
  /^I contemplate on "([^"]*)", "([^"]*)" to produce "([^"]*)" with:$/,
  async function (
    this: RoleXWorld,
    pattern1: string,
    pattern2: string,
    theoryName: string,
    source: string
  ) {
    await this.run(this.individualSystem, "contemplate", {
      patternNames: [pattern1, pattern2],
      theoryName,
      theorySource: source,
    });
  }
);

// ===== forget =====

When(/^I forget knowledge\.pattern "([^"]*)"$/, async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "forget", { type: "knowledge.pattern", name });
});

When(/^I forget experience\.insight "([^"]*)"$/, async function (this: RoleXWorld, name: string) {
  await this.run(this.individualSystem, "forget", { type: "experience.insight", name });
});
