import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";
import { resolveSource } from "../lib/source.js";

export const plan = defineCommand({
  meta: {
    name: "plan",
    description: "Design a plan for the current active goal",
  },
  args: {
    name: {
      type: "positional",
      description: "Plan name",
      required: true,
    },
    source: {
      type: "string",
      description: "Gherkin plan feature source text",
    },
    file: {
      type: "string",
      alias: "f",
      description: "Path to .feature file",
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const src = resolveSource(args);
      const result = await rolex.individual.execute("design", {
        name: args.name,
        source: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
