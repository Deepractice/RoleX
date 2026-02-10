import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const fire = defineCommand({
  meta: {
    name: "fire",
    description: "Fire a role from an organization",
  },
  args: {
    org: {
      type: "positional",
      description: "Organization name",
      required: true,
    },
    name: {
      type: "positional",
      description: "Role name to fire",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const result = await rolex.governance.execute("fire", {
        orgId: args.org,
        roleId: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to fire role");
      process.exit(1);
    }
  },
});
