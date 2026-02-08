import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const focus = defineCommand({
  meta: {
    name: "focus",
    description: "Show the current active goal for a role",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role ID (e.g. 'default/owner')",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);
      const goal = role.focus();

      if (!goal) {
        consola.info("No active goal.");
        return;
      }

      consola.info(`Goal: ${goal.name}`);
      for (const s of goal.scenarios) {
        console.log(`  - ${s.name}${s.verifiable ? " (testable)" : ""}`);
      }

      if (goal.plan) {
        console.log(`  Plan: ${goal.plan.name}`);
      }

      if (goal.tasks.length > 0) {
        console.log(`  Tasks: ${goal.tasks.length}`);
        for (const t of goal.tasks) {
          const done = t.tags.some((tag) => tag.name === "@done");
          console.log(`    ${done ? "[x]" : "[ ]"} ${t.name}`);
        }
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load focus");
      process.exit(1);
    }
  },
});
