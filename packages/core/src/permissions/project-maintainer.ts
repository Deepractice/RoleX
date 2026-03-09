/**
 * Project maintainer permissions — operations granted by the maintain relationship.
 *
 * The maintain relationship connects an individual to a project,
 * granting project management operations: scope, milestones,
 * participation, deliverables, wiki, and product creation.
 */
import type { Permission } from "@rolexjs/system";
import { processes } from "../descriptions/index.js";

const p = (command: string, key: string): Permission => ({
  command,
  content: processes[key],
});

export const projectMaintainerPermissions: readonly Permission[] = [
  p("project.scope", "scope"),
  p("project.milestone", "milestone"),
  p("project.achieve", "achieve"),
  p("project.enroll", "enroll"),
  p("project.remove", "remove"),
  p("project.deliver", "deliver"),
  p("project.wiki", "wiki"),
  p("project.produce", "produce"),
];
