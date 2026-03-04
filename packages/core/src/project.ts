/**
 * Project management — scoping, milestones, enrollment, deliverables, wiki.
 *
 * enroll / remove    — participation (who is involved)
 * scope              — define project boundary
 * milestone          — add checkpoint
 * deliver            — add deliverable
 * wiki               — add knowledge entry
 */
import { create, link, process, unlink } from "@rolexjs/system";
import { deliverable, milestone, project, scope, wiki } from "./structures.js";

// Participation
export const enroll = process(
  "enroll",
  "Enroll an individual into the project",
  project,
  link(project, "participation")
);
export const removeParticipant = process(
  "remove",
  "Remove an individual from the project",
  project,
  unlink(project, "participation")
);

// Structure
export const scopeProject = process(
  "scope",
  "Define the scope for a project",
  project,
  create(scope)
);
export const milestoneProject = process(
  "milestone",
  "Add a milestone to a project",
  project,
  create(milestone)
);
export const deliverProject = process(
  "deliver",
  "Add a deliverable to a project",
  project,
  create(deliverable)
);
export const wikiProject = process("wiki", "Add a wiki entry to a project", project, create(wiki));
