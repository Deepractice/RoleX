import { defineCommand } from "citty";
import consola from "consola";
import { LocalPlatform, resolveDir } from "@rolexjs/local-platform";

export const setting = defineCommand({
  meta: {
    name: "setting",
    description: "Get or set a RoleX setting (e.g. locale)",
  },
  args: {
    key: {
      type: "positional",
      description: "Setting key (e.g. 'locale')",
      required: true,
    },
    value: {
      type: "positional",
      description: "Setting value. Omit to read current value.",
      required: false,
    },
  },
  async run({ args }) {
    try {
      const platform = new LocalPlatform(resolveDir());

      if (args.value) {
        // Validate known keys
        if (args.key === "locale" && !["en", "zh"].includes(args.value)) {
          consola.error(`Invalid locale: ${args.value}. Supported: en, zh`);
          process.exit(1);
        }
        platform.writeSettings({ [args.key]: args.value });
        consola.success(`${args.key} = ${args.value}`);
      } else {
        const settings = platform.readSettings();
        const val = settings[args.key];
        if (val !== undefined) {
          consola.info(`${args.key} = ${val}`);
        } else {
          consola.info(`${args.key} is not set (default applies)`);
        }
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : "Failed");
      process.exit(1);
    }
  },
});
