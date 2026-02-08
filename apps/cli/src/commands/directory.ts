import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";

export const directory = defineCommand({
  meta: {
    name: "directory",
    description: "List all roles and organizations",
  },
  args: {},
  async run() {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();

      if (dir.organizations.length > 0) {
        consola.info("Organizations:");
        for (const org of dir.organizations) {
          console.log(`  ${org.name}`);
        }
      }

      if (dir.roles.length > 0) {
        consola.info("Roles:");
        for (const role of dir.roles) {
          console.log(`  ${role.role} (${role.id})`);
        }
      }

      if (dir.organizations.length === 0 && dir.roles.length === 0) {
        consola.info("No roles or organizations found.");
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to list directory");
      process.exit(1);
    }
  },
});
