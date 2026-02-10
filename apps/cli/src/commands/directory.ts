import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const directory = defineCommand({
  meta: {
    name: "directory",
    description: "Query an organization's directory (members, positions)",
  },
  args: {
    org: {
      type: "positional",
      description: "Organization name",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const result = await rolex.governance.execute("directory", {
        orgId: args.org,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to list directory");
      process.exit(1);
    }
  },
});
