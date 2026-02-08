import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";
import { resolveSource } from "../lib/source.js";

export const achieve = defineCommand({
  meta: {
    name: "achieve",
    description: "Mark the current active goal as achieved",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'sean')",
      required: true,
    },
    source: {
      type: "string",
      description: "Optional experience reflection (Gherkin source)",
    },
    file: {
      type: "string",
      alias: "f",
      description: "Path to experience .feature file",
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);

      let experience: string | undefined;
      try {
        experience = resolveSource(args);
      } catch {
        // No experience provided — that's fine
      }

      role.achieve(experience);
      consola.success(experience ? "Goal achieved. Experience captured." : "Goal achieved.");
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to achieve goal");
      process.exit(1);
    }
  },
});
