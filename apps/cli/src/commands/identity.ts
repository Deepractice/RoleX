import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const identity = defineCommand({
  meta: {
    name: "identity",
    description: "Load a role's identity",
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
      const rolex = createClient();
      const result = await rolex.individual.execute("identity", {
        roleId: args.roleId,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load identity");
      process.exit(1);
    }
  },
});
