import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const identity = defineCommand({
  meta: {
    name: "identity",
    description: "Load a role's identity",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role ID (e.g. 'default/owner')",
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

      consola.info(`Identity for ${args.roleId}:`);
      for (const f of features) {
        console.log(`  [${f.type}] ${f.name}`);
        for (const s of f.scenarios) {
          console.log(`    - ${s.name}${s.verifiable ? " (testable)" : ""}`);
        }
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to load identity");
      process.exit(1);
    }
  },
});
