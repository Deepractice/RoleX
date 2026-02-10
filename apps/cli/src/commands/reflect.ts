import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const reflect = defineCommand({
  meta: {
    name: "reflect",
    description: "Distill experiences into transferable knowledge",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
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
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const src = resolveSource(args);
      const experienceNames = args.experiences.split(",").map((s: string) => s.trim());
      const result = await rolex.individual.execute("reflect", {
        experienceNames,
        knowledgeName: args.knowledgeName,
        knowledgeSource: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to reflect");
      process.exit(1);
    }
  },
});
