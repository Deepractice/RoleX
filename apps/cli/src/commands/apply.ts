import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const apply = defineCommand({
  meta: {
    name: "apply",
    description: "Load procedural knowledge (skill) into context",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Procedure name to apply",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const result = await rolex.individual.execute("apply", {
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to apply procedure");
      process.exit(1);
    }
  },
});
