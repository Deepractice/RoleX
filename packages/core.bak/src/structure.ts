/**
 * RoleX Structures — containers with context.
 *
 * A structure is dynamic: its meaning depends on relationships
 * and accumulated information. Role changes depending on
 * which organization it belongs to; Organization changes
 * depending on its members and positions.
 *
 * Three structures form the social topology of RoleX:
 *   Role         — the actor (WHO)
 *   Organization — the collective (WHERE)
 *   Position     — the seat (WHAT responsibility)
 */

import type { StructureDefinition } from "@rolexjs/model";

export const ROLE: StructureDefinition = {
  name: "Role",
  description:
    "The actor — an identity that accumulates knowledge, experience, and pursues goals.",
  informationTypes: [
    "persona",
    "knowledge",
    "experience",
    "voice",
    "goal",
    "plan",
    "task",
    "duty",
    "skill",
  ],
};

export const ORGANIZATION: StructureDefinition = {
  name: "Organization",
  description:
    "The collective — a group of roles working together with shared positions.",
  informationTypes: ["charter"],
};

export const POSITION: StructureDefinition = {
  name: "Position",
  description:
    "The seat — a named responsibility within an organization, carrying duties.",
  informationTypes: ["duty"],
};

export const STRUCTURES: readonly StructureDefinition[] = [
  ROLE,
  ORGANIZATION,
  POSITION,
];
