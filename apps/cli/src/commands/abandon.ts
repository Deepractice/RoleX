import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const abandon = defineCommand({
  meta: {
    name: "abandon",
    description: "Abandon the current active goal",
  },
  args: {
    conclusion: {
      type: "string",
      description: "Gherkin — why abandoned",
    },
    expName: {
      type: "string",
      description: "Experience name",
    },
    expSource: {
      type: "string",
      description: "Gherkin — lessons from failure",
    },
    expFile: {
      type: "string",
      alias: "f",
      description: "Path to experience .feature file",
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const params: any = {};

      if (args.conclusion) params.conclusion = args.conclusion;

      if (args.expName) {
        let expSource: string;
        if (args.expFile) {
          const { readFileSync } = await import("node:fs");
          expSource = readFileSync(args.expFile, "utf-8");
        } else if (args.expSource) {
          expSource = args.expSource;
        } else {
          throw new Error("Either --expSource or --expFile is required when providing experience.");
        }
        params.experience = { name: args.expName, source: expSource };
      }

      const result = await rolex.individual.execute("abandon", params);
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
