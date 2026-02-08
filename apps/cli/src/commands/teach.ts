import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const teach = defineCommand({
  meta: {
    name: "teach",
    description: "Teach a role — transmit abstract, first-principles knowledge",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    type: {
      type: "positional",
      description: "Growth dimension: knowledge, experience, or voice",
      required: true,
    },
    name: {
      type: "positional",
      description: "Name for this knowledge (used as filename)",
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
      const src = resolveSource(args);
      const feature = rolex.teach(
        args.roleId,
        args.type as "knowledge" | "experience" | "voice",
        args.name,
        src
      );
      consola.success(`Taught ${args.type}: ${feature.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to teach role");
      process.exit(1);
    }
  },
});
