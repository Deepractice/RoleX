import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const forget = defineCommand({
  meta: {
    name: "forget",
    description: "Forget information — remove knowledge, experience, or procedure",
  },
  args: {
    type: {
      type: "positional",
      description:
        "Information type: knowledge.pattern, knowledge.procedure, knowledge.theory, experience.insight",
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
      const rolex = await createHydratedClient();
      const result = await rolex.individual.execute("forget", {
        type: args.type,
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
