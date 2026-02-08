/**
 * Source text helpers — read from --source or --file.
 */

import { readFileSync } from "node:fs";

export function resolveSource(args: { source?: string; file?: string }): string {
  if (args.file) {
    return readFileSync(args.file, "utf-8");
  }
  if (args.source) {
    return args.source;
  }
  throw new Error("Either --source or --file is required.");
}
