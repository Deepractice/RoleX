import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";
import { resolveSource } from "../lib/source.js";

export const teach = defineCommand({
  meta: {
    name: "teach",
    description: "Teach a role — add knowledge, experience, or voice",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'alex')",
      required: true,
    },
    type: {
      type: "positional",
      description: "Growth dimension: knowledge, experience, or voice",
      required: true,
    },
    name: {
      type: "positional",
      description: "Name for this growth (used as filename)",
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
      const src = resolveSource(args);
      const feature = org.teach(
        args.roleId,
        args.type as "knowledge" | "experience" | "voice",
        args.name,
        src,
      );
      consola.success(`Taught ${args.type}: ${feature.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to teach role");
      process.exit(1);
    }
  },
});
