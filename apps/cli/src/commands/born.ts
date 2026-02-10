import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const born = defineCommand({
  meta: {
    name: "born",
    description: "Create a new role with its persona",
  },
  args: {
    name: {
      type: "positional",
      description: "Role name",
      required: true,
    },
    source: { type: "string", description: "Gherkin persona source" },
    file: { type: "string", alias: "f", description: "Path to .feature file" },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const src = resolveSource(args);
      const result = await rolex.role.execute("born", { name: args.name, source: src });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
