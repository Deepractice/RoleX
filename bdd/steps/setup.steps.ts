/**
 * Common Given steps — platform setup, role/org creation, identity activation.
 */

import { Given, Before } from "@deepractice/bdd";
import { RoleXWorld } from "../support/world";

// ========== Fresh Platform ==========

Given("a fresh RoleX platform", function (this: RoleXWorld) {
  this.init();
  // Create society node for explore
  this.graph.addNode("society", "society");
});

// ========== Role Helpers ==========

Given("role {string} exists", async function (this: RoleXWorld, name: string) {
  await this.roleSystem.execute("born", {
    name,
    source: `Feature: ${name}\n  Scenario: Identity\n    Given I am ${name}`,
  });
});

Given(
  "role {string} exists with persona {string}",
  async function (this: RoleXWorld, name: string, persona: string) {
    await this.roleSystem.execute("born", {
      name,
      source: `Feature: ${name}\n  Scenario: Identity\n    Given ${persona}`,
    });
  },
);

Given(
  "role {string} has knowledge.pattern {string}",
  async function (this: RoleXWorld, role: string, name: string) {
    await this.roleSystem.execute("teach", {
      roleId: role,
      name,
      source: `Feature: ${name}\n  Scenario: Knowledge\n    Given I know ${name}`,
    });
  },
);

Given(
  "role {string} has knowledge.procedure {string}",
  async function (this: RoleXWorld, role: string, name: string) {
    await this.roleSystem.execute("train", {
      roleId: role,
      name,
      source: `Feature: ${name}\n  Scenario: Procedure\n    Given I can do ${name}`,
    });
  },
);

// ========== Identity Activation ==========

Given("I am {string}", async function (this: RoleXWorld, name: string) {
  await this.individualSystem.execute("identity", { roleId: name });
});

// ========== Goal Hierarchy Helpers ==========

Given("I have goal {string}", async function (this: RoleXWorld, name: string) {
  await this.individualSystem.execute("want", {
    name,
    source: `Feature: ${name}\n  Scenario: Goal\n    Given I want ${name}`,
  });
});

Given(
  "I have goal {string} with plan {string}",
  async function (this: RoleXWorld, goal: string, plan: string) {
    await this.individualSystem.execute("want", {
      name: goal,
      source: `Feature: ${goal}\n  Scenario: Goal\n    Given I want ${goal}`,
    });
    await this.individualSystem.execute("design", {
      name: plan,
      source: `Feature: ${plan}\n  Scenario: Plan\n    Given plan for ${goal}`,
    });
  },
);

Given(
  "I have goal {string} with plan {string} and task {string}",
  async function (this: RoleXWorld, goal: string, plan: string, task: string) {
    await this.individualSystem.execute("want", {
      name: goal,
      source: `Feature: ${goal}\n  Scenario: Goal\n    Given I want ${goal}`,
    });
    await this.individualSystem.execute("design", {
      name: plan,
      source: `Feature: ${plan}\n  Scenario: Plan\n    Given plan for ${goal}`,
    });
    await this.individualSystem.execute("todo", {
      name: task,
      source: `Feature: ${task}\n  Scenario: Task\n    Given do ${task}`,
    });
  },
);

Given(
  "I have goal {string} without plan",
  async function (this: RoleXWorld, goal: string) {
    await this.individualSystem.execute("want", {
      name: goal,
      source: `Feature: ${goal}\n  Scenario: Goal\n    Given I want ${goal}`,
    });
  },
);

Given(
  "I have a finished goal {string}",
  async function (this: RoleXWorld, goal: string) {
    await this.individualSystem.execute("want", {
      name: goal,
      source: `Feature: ${goal}\n  Scenario: Goal\n    Given I want ${goal}`,
    });
    await this.individualSystem.execute("design", {
      name: `${goal}-plan`,
      source: `Feature: ${goal} Plan\n  Scenario: Plan\n    Given plan it`,
    });
    await this.individualSystem.execute("todo", {
      name: `${goal}-task`,
      source: `Feature: ${goal} Task\n  Scenario: Task\n    Given do it`,
    });
    await this.individualSystem.execute("finish", {
      name: `${goal}-task`,
      conclusion: `Feature: Done\n  Scenario: Result\n    Given completed`,
    });
  },
);

// ========== Knowledge & Experience Helpers ==========

Given(
  "I have experience.insight {string}",
  async function (this: RoleXWorld, name: string) {
    // Create insight via a quick goal cycle
    const goalName = `_insight-goal-${name}`;
    await this.individualSystem.execute("want", {
      name: goalName,
      source: `Feature: ${goalName}\n  Scenario: Temp\n    Given temp goal for insight`,
    });
    await this.individualSystem.execute("design", {
      name: `${goalName}-plan`,
      source: `Feature: Plan\n  Scenario: Plan\n    Given plan`,
    });
    await this.individualSystem.execute("todo", {
      name: `${goalName}-task`,
      source: `Feature: Task\n  Scenario: Task\n    Given task`,
    });
    await this.individualSystem.execute("finish", { name: `${goalName}-task` });
    await this.individualSystem.execute("achieve", {
      experience: {
        name,
        source: `Feature: ${name}\n  Scenario: Insight\n    Given learned from ${name}`,
      },
    });
  },
);

Given(
  /^I have knowledge\.pattern "([^"]*)"$/,
  async function (this: RoleXWorld, name: string) {
    // Get active role from graph
    const roleKey = this.graph.getNode("society")
      ? this.individualSystem.ctx?.structure
      : undefined;
    if (roleKey) {
      await this.roleSystem.execute("teach", {
        roleId: roleKey,
        name,
        source: `Feature: ${name}\n  Scenario: Pattern\n    Given ${name} principle`,
      });
    }
  },
);

Given(
  /^I have knowledge\.pattern "([^"]*)" with:$/,
  async function (this: RoleXWorld, name: string, source: string) {
    const roleKey = this.individualSystem.ctx?.structure;
    if (roleKey) {
      await this.roleSystem.execute("teach", {
        roleId: roleKey,
        name,
        source,
      });
    }
  },
);

// ========== Org Helpers ==========

Given("org {string} exists", async function (this: RoleXWorld, name: string) {
  await this.orgSystem.execute("found", {
    name,
    source: `Feature: ${name}\n  Scenario: Charter\n    Given org ${name}`,
  });
});

Given(
  "org {string} exists with charter {string}",
  async function (this: RoleXWorld, name: string, charter: string) {
    await this.orgSystem.execute("found", {
      name,
      source: `Feature: ${name}\n  Scenario: Charter\n    Given ${charter}`,
    });
  },
);

Given(
  "org {string} exists with position {string} and member {string}",
  async function (this: RoleXWorld, org: string, position: string, member: string) {
    await this.orgSystem.execute("found", {
      name: org,
      source: `Feature: ${org}\n  Scenario: Charter\n    Given org ${org}`,
    });
    await this.govSystem.execute("establish", {
      orgName: org,
      name: position,
      source: `Feature: ${position}\n  Scenario: Duties\n    Given ${position} duties`,
    });
    // Ensure member role exists
    if (!this.graph.hasNode(member)) {
      await this.roleSystem.execute("born", {
        name: member,
        source: `Feature: ${member}\n  Scenario: Id\n    Given I am ${member}`,
      });
    }
    await this.govSystem.execute("hire", { orgName: org, roleName: member });
  },
);

Given(
  "position {string} exists in {string}",
  async function (this: RoleXWorld, position: string, org: string) {
    if (!this.graph.hasNode(`${org}/${position}`)) {
      await this.govSystem.execute("establish", {
        orgName: org,
        name: position,
        source: `Feature: ${position}\n  Scenario: Duties\n    Given ${position} duties`,
      });
    }
  },
);

Given(
  "{string} is a member of {string}",
  async function (this: RoleXWorld, role: string, org: string) {
    if (!this.graph.hasEdge(org, role)) {
      await this.govSystem.execute("hire", { orgName: org, roleName: role });
    }
  },
);

Given(
  "{string} is assigned to {string}",
  async function (this: RoleXWorld, role: string, position: string) {
    // Ensure membership first
    const orgName = position.split("/")[0];
    if (!this.graph.hasEdge(orgName, role)) {
      await this.govSystem.execute("hire", { orgName, roleName: role });
    }
    if (!this.graph.hasEdge(position, role)) {
      await this.govSystem.execute("appoint", { roleName: role, positionName: position });
    }
  },
);
