/**
 * Organization — structure, information, and process declarations.
 *
 * Two systems:
 *   Organization System (external): found, dissolve
 *   Governance System (internal): rule, establish, abolish, assign,
 *                                  hire, fire, appoint, dismiss, directory
 */

import type {
  InformationType,
  StructureDefinition,
  RelationDefinition,
  ProcessDefinition,
  SystemDefinition,
} from "@rolexjs/system";

// ========== Structure ==========

export const ORGANIZATION: StructureDefinition = {
  name: "Organization",
  description: "A group structure — holds charter, positions, and members.",
  informationTypes: ["charter"],
};

export const POSITION: StructureDefinition = {
  name: "Position",
  description: "A role slot within an organization — holds duty definitions.",
  informationTypes: ["duty"],
};

// ========== Information ==========

export const CHARTER: InformationType = {
  type: "charter",
  description: "Organizational rules — mission, values, policies, regulations.",
  belongsTo: "Organization",
};

export const DUTY: InformationType = {
  type: "duty",
  description: "Position responsibilities — what this position requires.",
  belongsTo: "Position",
};

// ========== Relation ==========

export const MEMBERSHIP: RelationDefinition = {
  name: "membership",
  description: "A role belongs to an organization.",
  from: "Role",
  to: "Organization",
  cardinality: "many-to-many",
};

export const ASSIGNMENT: RelationDefinition = {
  name: "assignment",
  description: "A role is assigned to a position.",
  from: "Role",
  to: "Position",
  cardinality: "many-to-many",
};

// ========== Process: Organization System (external) ==========

export const FOUND: ProcessDefinition = {
  name: "found",
  description: "Create an organization.",
  kind: "create",
  targets: ["Organization"],
  inputs: [],
  outputs: ["charter"],
};

export const DISSOLVE: ProcessDefinition = {
  name: "dissolve",
  description: "Dissolve an organization — archive all data.",
  kind: "write",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

// ========== Process: Governance System (internal) ==========

export const RULE: ProcessDefinition = {
  name: "rule",
  description: "Write or update a charter entry for the organization.",
  kind: "write",
  targets: ["Organization"],
  inputs: [],
  outputs: ["charter"],
};

export const ESTABLISH: ProcessDefinition = {
  name: "establish",
  description: "Create a position within the organization.",
  kind: "create",
  targets: ["Position"],
  inputs: [],
  outputs: ["duty"],
};

export const ABOLISH: ProcessDefinition = {
  name: "abolish",
  description: "Remove a position from the organization.",
  kind: "write",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const ASSIGN: ProcessDefinition = {
  name: "assign",
  description: "Write or update duty for a position.",
  kind: "write",
  targets: ["Position"],
  inputs: [],
  outputs: ["duty"],
};

export const HIRE: ProcessDefinition = {
  name: "hire",
  description: "Add a role as a member of the organization.",
  kind: "relate",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

export const FIRE: ProcessDefinition = {
  name: "fire",
  description: "Remove a role from the organization. Auto-dismisses from positions.",
  kind: "relate",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

export const APPOINT: ProcessDefinition = {
  name: "appoint",
  description: "Assign a role to a position.",
  kind: "relate",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const DISMISS: ProcessDefinition = {
  name: "dismiss",
  description: "Remove a role from a position.",
  kind: "relate",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const DIRECTORY: ProcessDefinition = {
  name: "directory",
  description: "Query the organization — members, positions, assignments.",
  kind: "query",
  targets: ["Organization"],
  inputs: ["charter", "duty"],
  outputs: [],
};

// ========== System ==========

export const ORG_LIFECYCLE: SystemDefinition = {
  name: "org-lifecycle",
  description: "External management of organization lifecycle — create and dissolve.",
  processes: ["found", "dissolve"],
  feedback: [],
};

export const GOVERNANCE: SystemDefinition = {
  name: "governance",
  description: "Internal governance — rules, positions, membership, assignments.",
  processes: ["rule", "establish", "abolish", "assign", "hire", "fire", "appoint", "dismiss", "directory"],
  feedback: [],
};
