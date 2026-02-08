import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization, renderFeatures } from "rolexjs";

export const identity = defineCommand({
  meta: {
    name: "identity",
    description: "Load a role's identity",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);
      const features = role.identity();

      console.log(renderFeatures(features));
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load identity");
      process.exit(1);
    }
  },
});
