/**
 * Organization + Governance steps — found, dissolve, rule, establish,
 * hire, fire, appoint, dismiss, abolish, assign, directory.
 */

import { When } from "@deepractice/bdd";
import { RoleXWorld } from "../support/world";

// ===== Organization System =====

When(
  "I found org {string} with:",
  async function (this: RoleXWorld, name: string, source: string) {
    await this.run(this.orgSystem, "found", { name, source });
  },
);

When("I dissolve org {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.orgSystem, "dissolve", { name });
});

// ===== Governance System =====

When(
  "I rule {string} charter {string} with:",
  async function (this: RoleXWorld, org: string, name: string, source: string) {
    await this.run(this.govSystem, "rule", { orgName: org, name, source });
  },
);

When(
  "I establish position {string} in {string} with:",
  async function (this: RoleXWorld, name: string, org: string, source: string) {
    await this.run(this.govSystem, "establish", { orgName: org, name, source });
  },
);

When(
  "I assign duty {string} to {string} with:",
  async function (this: RoleXWorld, name: string, position: string, source: string) {
    await this.run(this.govSystem, "assign", { positionName: position, name, source });
  },
);

When(
  "I hire {string} into {string}",
  async function (this: RoleXWorld, role: string, org: string) {
    await this.run(this.govSystem, "hire", { orgName: org, roleName: role });
  },
);

When(
  "I fire {string} from {string}",
  async function (this: RoleXWorld, role: string, org: string) {
    await this.run(this.govSystem, "fire", { orgName: org, roleName: role });
  },
);

When(
  "I appoint {string} to {string}",
  async function (this: RoleXWorld, role: string, position: string) {
    await this.run(this.govSystem, "appoint", { roleName: role, positionName: position });
  },
);

When(
  "I dismiss {string} from {string}",
  async function (this: RoleXWorld, role: string, position: string) {
    await this.run(this.govSystem, "dismiss", { roleName: role, positionName: position });
  },
);

When(
  "I abolish position {string} in {string}",
  async function (this: RoleXWorld, name: string, org: string) {
    await this.run(this.govSystem, "abolish", { orgName: org, name });
  },
);

When(
  "I query directory of {string}",
  async function (this: RoleXWorld, org: string) {
    await this.run(this.govSystem, "directory", { orgName: org });
  },
);
