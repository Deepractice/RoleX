import { defineCommand } from "citty";
import consola from "consola";
import { createClient } from "../lib/client.js";

export const appoint = defineCommand({
  meta: {
    name: "appoint",
    description: "Appoint a role to a position",
  },
  args: {
    role: {
      type: "positional",
      description: "Role name",
      required: true,
    },
    position: {
      type: "positional",
      description: "Position name",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createClient();
      const result = await rolex.governance.execute("appoint", {
        roleName: args.role,
        positionName: args.position,
      });
      consola.success(result);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
