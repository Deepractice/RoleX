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
  p("individual.born", "born"),
  p("individual.retire", "retire"),
  p("individual.die", "die"),
  p("individual.rehire", "rehire"),
  p("individual.teach", "teach"),
  p("individual.train", "train"),

  // Organization lifecycle
  p("org.found", "found"),
  p("org.dissolve", "dissolve"),

  // Position lifecycle
  p("position.establish", "establish"),
  p("position.abolish", "abolish"),

  // Project lifecycle
  p("project.launch", "launch"),
  p("project.archive", "archive"),
];
