import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const finish = defineCommand({
  meta: {
    name: "finish",
    description: "Mark a task as done",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Task name to mark as done",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const result = await rolex.individual.execute("finish", {
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to finish task");
      process.exit(1);
    }
  },
});
