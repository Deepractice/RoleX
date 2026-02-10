import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const synthesize = defineCommand({
  meta: {
    name: "synthesize",
    description: "Synthesize encounters into experience (a posteriori learning)",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Name for this experience",
      required: true,
    },
    source: {
      type: "string",
      description: "Gherkin experience feature source text",
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
      const result = await rolex.individual.execute("synthesize", {
        name: args.name,
        source: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to synthesize experience");
      process.exit(1);
    }
  },
});
