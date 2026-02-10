import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const establish = defineCommand({
  meta: {
    name: "establish",
    description: "Establish a position in an organization",
  },
  args: {
    org: {
      type: "positional",
      description: "Organization name",
      required: true,
    },
    name: {
      type: "positional",
      description: "Position name",
      required: true,
    },
    source: { type: "string", description: "Gherkin duty source" },
    file: { type: "string", alias: "f", description: "Path to .feature file" },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const src = resolveSource(args);
      const result = await rolex.governance.execute("establish", {
        orgName: args.org,
        name: args.name,
        source: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
