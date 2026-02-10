import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const achieve = defineCommand({
  meta: {
    name: "achieve",
    description: "Mark the current active goal as achieved (conclusion + experience)",
  },
  args: {
    conclusion: {
      type: "string",
      description: "Gherkin — goal-level summary",
      required: true,
    },
    expName: {
      type: "string",
      description: "Experience name",
      required: true,
    },
    expSource: {
      type: "string",
      description: "Gherkin — distilled experience source",
    },
    expFile: {
      type: "string",
      alias: "f",
      description: "Path to experience .feature file",
    },
    conclusionFile: {
      type: "string",
      alias: "c",
      description: "Path to conclusion .feature file",
    },
  },
  async run({ args }) {
    try {
      const rolex = await createHydratedClient();
      const { readFileSync } = await import("node:fs");

      const conclusion = args.conclusionFile
        ? readFileSync(args.conclusionFile, "utf-8")
        : args.conclusion;

      let expSource: string;
      if (args.expFile) {
        expSource = readFileSync(args.expFile, "utf-8");
      } else if (args.expSource) {
        expSource = args.expSource;
      } else {
        throw new Error("Either --expSource or --expFile is required for experience.");
      }

      const result = await rolex.individual.execute("achieve", {
        conclusion,
        experience: { name: args.expName, source: expSource },
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
