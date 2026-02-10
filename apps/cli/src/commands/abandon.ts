import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const abandon = defineCommand({
  meta: {
    name: "abandon",
    description: "Abandon the current active goal",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    source: {
      type: "string",
      description: "Optional experience Gherkin source",
    },
    file: {
      type: "string",
      alias: "f",
      description: "Path to experience .feature file",
    },
    expName: {
      type: "string",
      description: "Experience name (required if providing experience source)",
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });

      let experience: { name: string; source: string } | undefined;
      try {
        const src = resolveSource(args);
        if (args.expName) {
          experience = { name: args.expName, source: src };
        }
      } catch {
        // No experience provided — that's fine
      }

      const result = await rolex.individual.execute("abandon", { experience });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to abandon goal");
      process.exit(1);
    }
  },
});
