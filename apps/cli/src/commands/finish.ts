import { defineCommand } from "citty";
import consola from "consola";
import { createRolex } from "../lib/client.js";
import { Organization } from "rolexjs";

export const finish = defineCommand({
  meta: {
    name: "finish",
    description: "Mark a task as done",
  },
  args: {
    roleId: {
      type: "positional",
      description: "Role name (e.g. 'alex')",
      required: true,
    },
    name: {
      type: "positional",
      description: "Task name to mark as done",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const rolex = createRolex();
      const dir = rolex.directory();
      const org = rolex.find(dir.organizations[0].name) as Organization;
      const role = org.role(args.roleId);
      role.finish(args.name);
      consola.success(`Task finished: ${args.name}`);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed to finish task");
      process.exit(1);
    }
  },
});
