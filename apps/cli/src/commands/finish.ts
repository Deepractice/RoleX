import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";

export const finish = defineCommand({
  meta: {
    name: "finish",
    description: "Mark a task as done",
  },
  args: {
    name: {
      type: "positional",
      description: "Task name to mark as done",
      required: true,
    },
    conclusion: {
      type: "string",
      description: "Gherkin — task completion summary",
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
      const params: any = { name: args.name };
      if (args.conclusionFile) {
        const { readFileSync } = await import("node:fs");
        params.conclusion = readFileSync(args.conclusionFile, "utf-8");
      } else if (args.conclusion) {
        params.conclusion = args.conclusion;
      }
      const result = await rolex.individual.execute("finish", params);
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
