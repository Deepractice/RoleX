/**
 * Org admin permissions — operations granted by the admin relationship.
 *
 * The admin relationship connects an individual to an organization,
 * granting organization management operations: charter, membership,
 * position lifecycle, and project lifecycle.
 */
import type { Permission } from "@rolexjs/system";
import { processes } from "../descriptions/index.js";

const p = (command: string, key: string): Permission => ({
  command,
  content: processes[key],
});

export const orgAdminPermissions: readonly Permission[] = [
  // Org internal management
  p("org.charter", "charter"),
  p("org.hire", "hire"),
  p("org.fire", "fire"),

  // Position lifecycle (org creates positions)
  p("position.establish", "establish"),
  p("position.abolish", "abolish"),
  p("position.charge", "charge"),
  p("position.require", "require"),
  p("position.appoint", "appoint"),
  p("position.dismiss", "dismiss"),

  // Project lifecycle (org creates projects)
  p("project.launch", "launch"),
  p("project.archive", "archive"),
];
