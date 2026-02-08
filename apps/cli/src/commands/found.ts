import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";

export const found = defineCommand({
  meta: {
    name: "found",
    description: "Found an organization",
  },
  args: {
    name: {
      type: "positional",
      description: "Organization name (e.g. 'Deepractice')",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      rolex.found(args.name);
      consola.success(`Organization founded: ${args.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to found organization");
      process.exit(1);
    }
  },
});
