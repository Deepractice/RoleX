import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const skill = defineCommand({
  meta: {
    name: "skill",
    description: "Load a skill — read procedure and load SKILL.md instructions",
  },
  args: {
    name: {
      type: "positional",
      description: "Procedure name to load",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const result = await rolex.individual.execute("skill", {
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
