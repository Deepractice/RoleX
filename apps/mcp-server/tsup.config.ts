import { readFileSync, writeFileSync } from "fs";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    outDir: "dist",
    clean: true,
    sourcemap: true,
    onSuccess: async () => {
      // Prepend shebang — must be first line for OS to recognize it
      const file = "dist/cli.js";
      const content = readFileSync(file, "utf-8");
      if (!content.startsWith("#!")) {
        writeFileSync(file, `#!/usr/bin/env node\n${content}`);
      }
    },
  },
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    outDir: "dist",
    sourcemap: true,
  },
]);
