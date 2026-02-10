import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const plan = defineCommand({
  meta: {
    name: "plan",
    description: "Design a plan for the current active goal",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
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
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const src = resolveSource(args);
      const result = await rolex.individual.execute("design", { source: src });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to create plan");
      process.exit(1);
    }
  },
});
