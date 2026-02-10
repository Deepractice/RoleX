/**
 * RoleX Relations — system-managed connections between structures.
 *
 * Relations are not Gherkin — they are structural data managed
 * programmatically by the system. They define the topology:
 * who belongs where, who holds what, who knows what.
 *
 * Three relations form the social fabric of RoleX:
 *   membership  — Role belongs to Organization
 *   assignment  — Role holds a Position
 *   equipment   — Role has a Skill
 */

import type { RelationDefinition } from "@rolexjs/model";

export const MEMBERSHIP: RelationDefinition = {
  name: "membership",
  description:
    "A role belongs to an organization as a member. Established by hire, dissolved by fire.",
  from: "Role",
  to: "Organization",
  cardinality: "many-to-many",
};

export const ASSIGNMENT: RelationDefinition = {
  name: "assignment",
  description:
    "A role holds a position within an organization. Established by appoint, dissolved by dismiss.",
  from: "Role",
  to: "Position",
  cardinality: "one-to-one",
};

export const EQUIPMENT: RelationDefinition = {
  name: "equipment",
  description:
    "A role has a skill equipped. Established by equip, dissolved by unequip.",
  from: "Role",
  to: "Skill",
  cardinality: "many-to-many",
};

export const RELATION_TYPES: readonly RelationDefinition[] = [
  MEMBERSHIP,
  ASSIGNMENT,
  EQUIPMENT,
];
