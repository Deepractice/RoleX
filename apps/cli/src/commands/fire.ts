import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const fire = defineCommand({
  meta: {
    name: "fire",
    description: "Fire a role from the organization",
  },
  args: {
    name: {
      type: "positional",
      description: "Role name to fire",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      org.fire(args.name);
      consola.success(`Role fired: ${args.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to fire role");
      process.exit(1);
    }
  },
});
