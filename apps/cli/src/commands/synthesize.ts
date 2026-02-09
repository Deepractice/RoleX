import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";
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
      description: "Name for this experience (used as filename)",
      required: true,
    },
    source: {
      type: "string",
      description: "Gherkin feature source text",
    },
    file: {
      type: "string",
      alias: "f",
      description: "Path to .feature file",
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);
      const src = resolveSource(args);
      const feature = role.synthesize(args.name, src);
      consola.success(`Experience synthesized: ${feature.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to synthesize experience");
      process.exit(1);
    }
  },
});
