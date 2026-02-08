import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization, renderFeature } from "rolexjs";

export const focus = defineCommand({
  meta: {
    name: "focus",
    description: "Show the current active goal for a role",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
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

      const parts: string[] = [renderFeature(goal)];
      if (goal.plan) {
        parts.push(renderFeature(goal.plan));
      }
      for (const task of goal.tasks) {
        parts.push(renderFeature(task));
      }
      console.log(parts.join("\n\n"));
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load focus");
      process.exit(1);
    }
  },
});
