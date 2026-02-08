import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const find = defineCommand({
  meta: {
    name: "find",
    description: "Find a role or organization by name",
  },
  args: {
    name: {
      type: "positional",
      description: "Name to search for",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const result = rolex.find(args.name);

      if (result instanceof Organization) {
        const info = result.info();
        consola.success(`Organization: ${info.name}`);
        console.log(`  Roles: ${info.roles.length}`);
        for (const role of info.roles) {
          console.log(`    ${role.role} (${role.id})`);
        }
      } else {
        const features = result.identity();
        consola.success(`Role: ${args.name}`);
        console.log(`  Identity features: ${features.length}`);
        for (const f of features) {
          console.log(`    [${f.type}] ${f.name}`);
        }
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Not found");
      process.exit(1);
    }
  },
});
