import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const hire = defineCommand({
  meta: {
    name: "hire",
    description: "Hire a role into an organization",
  },
  args: {
    org: {
      type: "positional",
      description: "Organization name",
      required: true,
    },
    name: {
      type: "positional",
      description: "Role name to hire",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const result = await rolex.governance.execute("hire", {
        orgId: args.org,
        roleId: args.name,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to hire role");
      process.exit(1);
    }
  },
});
