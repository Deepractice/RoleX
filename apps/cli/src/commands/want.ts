import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";
import { resolveSource } from "../lib/source.js";

export const want = defineCommand({
  meta: {
    name: "want",
    description: "Create a new goal for a role",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role ID (e.g. 'default/owner')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Goal name (used as directory name)",
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
    testable: {
      type: "boolean",
      description: "Mark scenarios as testable",
      default: false,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);
      const src = resolveSource(args);
      const goal = role.want(args.name, src, args.testable);
      consola.success(`Goal created: ${goal.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to create goal");
      process.exit(1);
    }
  },
});
