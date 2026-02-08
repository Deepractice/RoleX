import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const hire = defineCommand({
  meta: {
    name: "hire",
    description: "Hire a role into the organization",
  },
  args: {
    name: {
      type: "positional",
      description: "Role name to hire",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      org.hire(args.name);
      consola.success(`Role hired: ${args.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to hire role");
      process.exit(1);
    }
  },
});
