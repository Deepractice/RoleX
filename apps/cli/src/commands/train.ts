import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const train = defineCommand({
  meta: {
    name: "train",
    description: "Train a role with procedural knowledge (skills, workflows)",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Procedure name",
      required: true,
    },
    source: {
      type: "string",
      description: "Gherkin procedure source text",
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
      const src = resolveSource(args);
      const result = await rolex.role.execute("train", {
        roleId: args.roleId,
        name: args.name,
        source: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to train role");
      process.exit(1);
    }
  },
});
