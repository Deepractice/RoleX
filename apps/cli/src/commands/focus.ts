import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const focus = defineCommand({
  meta: {
    name: "focus",
    description: "Show or switch the current active goal for a role",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "string",
      description: "Goal name to switch focus to",
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const result = await rolex.individual.execute("focus", {
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load focus");
      process.exit(1);
    }
  },
});
