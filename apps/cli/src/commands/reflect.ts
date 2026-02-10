import { defineCommand } from "citty";
import consola from "consola";
import { createHydratedClient } from "../lib/session.js";
import { resolveSource } from "../lib/source.js";

export const reflect = defineCommand({
  meta: {
    name: "reflect",
    description: "Distill experiences into transferable knowledge",
  },
  args: {
    knowledgeName: {
      type: "positional",
      description: "Knowledge name to produce",
      required: true,
    },
    experiences: {
      type: "string",
      description: "Comma-separated experience names to consume",
      required: true,
    },
    source: {
      type: "string",
      description: "Gherkin knowledge source text",
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
      const experienceNames = args.experiences.split(",").map((s: string) => s.trim());
      const result = await rolex.individual.execute("reflect", {
        experienceNames,
        knowledgeName: args.knowledgeName,
        knowledgeSource: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
