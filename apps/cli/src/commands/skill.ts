import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const skill = defineCommand({
  meta: {
    name: "skill",
    description: "Load a skill — read procedure and load SKILL.md instructions",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Procedure name to load",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      await rolex.individual.execute("identity", { roleId: args.roleId });
      const result = await rolex.individual.execute("skill", {
        name: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load skill");
      process.exit(1);
    }
  },
});
