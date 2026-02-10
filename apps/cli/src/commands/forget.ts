import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const forget = defineCommand({
  meta: {
    name: "forget",
    description: "Forget information — remove knowledge, experience, or procedure",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    type: {
      type: "positional",
      description: "Information type: knowledge, experience, or procedure",
      required: true,
    },
    name: {
      type: "positional",
      description: "Name of the information to forget",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const result = await rolex.individual.execute("forget", {
        type: args.type,
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to forget");
      process.exit(1);
    }
  },
});
