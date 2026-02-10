import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const focus = defineCommand({
  meta: {
    name: "focus",
    description: "Show or switch the current active goal",
  },
  args: {
    name: {
      type: "positional",
      description: "Goal name to switch focus to",
      required: false,
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const params: any = {};
      if (args.name) params.name = args.name;
      const result = await rolex.individual.execute("focus", params);
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
