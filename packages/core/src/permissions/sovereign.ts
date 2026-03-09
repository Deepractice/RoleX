/**
 * Sovereign permissions — operations granted by the sovereign relationship.
 *
 * The sovereign relationship connects an individual to society,
 * granting top-level lifecycle operations: creating/archiving
 * individuals, organizations, positions, and projects.
 *
 * Permission content comes from descriptions/*.feature files.
 */
import type { Permission } from "@rolexjs/system";
import { processes } from "../descriptions/index.js";

const p = (command: string, key: string): Permission => ({
  command,
  content: processes[key],
});

export const sovereignPermissions: readonly Permission[] = [
  // Individual lifecycle
  p("society.born", "born"),
  p("society.retire", "retire"),
  p("society.die", "die"),
  p("society.rehire", "rehire"),
  p("society.teach", "teach"),
  p("society.train", "train"),

  // Organization lifecycle
  p("society.found", "found"),
  p("society.dissolve", "dissolve"),
];
