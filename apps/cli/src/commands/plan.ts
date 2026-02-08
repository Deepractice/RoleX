import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";
import { resolveSource } from "../lib/source.js";

export const plan = defineCommand({
  meta: {
    name: "plan",
    description: "Create a plan for the current active goal",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role ID (e.g. 'default/owner')",
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
      const p = role.plan(src);
      consola.success(`Plan created: ${p.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to create plan");
      process.exit(1);
    }
  },
});
