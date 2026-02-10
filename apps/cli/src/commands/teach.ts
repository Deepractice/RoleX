import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";
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
      const rolex = createClient();
      const src = resolveSource(args);
      const result = await rolex.role.execute("teach", {
        roleId: args.roleId,
        type: args.type as "knowledge" | "experience" | "voice",
        name: args.name,
        source: src,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to teach role");
      process.exit(1);
    }
  },
});
