import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { resolveSource } from "../lib/source.js";

export const born = defineCommand({
  meta: {
    name: "born",
    description: "Create a new role with its persona",
  },
  args: {
    name: {
      type: "positional",
      description: "Role name (e.g. 'alex')",
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
      const persona = rolex.born(args.name, src);
      consola.success(`Role born: ${persona.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to create role");
      process.exit(1);
    }
  },
});
