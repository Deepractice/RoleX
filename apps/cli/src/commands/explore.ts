import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const explore = defineCommand({
  meta: {
    name: "explore",
    description: "Explore the RoleX world — discover roles, organizations, and relationships",
  },
  args: {
    name: {
      type: "positional",
      description: "Name of role or organization to explore",
      required: false,
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const params: any = {};
      if (args.name) params.name = args.name;
      const result = await rolex.individual.execute("explore", params);
      consola.log(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
