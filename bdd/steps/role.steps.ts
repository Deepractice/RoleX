/**
 * Role System steps — born, teach, train, retire, kill.
 */

import { When } from "@deepractice/bdd";
import { RoleXWorld } from "../support/world";

When(
  "I born a role {string} with:",
  async function (this: RoleXWorld, name: string, source: string) {
    await this.run(this.roleSystem, "born", { name, source });
  },
);

When(
  "I teach {string} knowledge {string} with:",
  async function (this: RoleXWorld, role: string, name: string, source: string) {
    await this.run(this.roleSystem, "teach", { roleId: role, name, source });
  },
);

When(
  "I train {string} procedure {string} with:",
  async function (this: RoleXWorld, role: string, name: string, source: string) {
    await this.run(this.roleSystem, "train", { roleId: role, name, source });
  },
);

When("I retire role {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.roleSystem, "retire", { name });
});

When("I kill role {string}", async function (this: RoleXWorld, name: string) {
  await this.run(this.roleSystem, "kill", { name });
});
