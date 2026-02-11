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

import { org as orgDesc, governance as govDesc } from "./descriptions/index.js";

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
  description: orgDesc.found,
  kind: "create",
  targets: ["Organization"],
  inputs: [],
  outputs: ["charter"],
};

export const DISSOLVE: ProcessDefinition = {
  name: "dissolve",
  description: orgDesc.dissolve,
  kind: "write",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

// ========== Process: Governance System (internal) ==========

export const RULE: ProcessDefinition = {
  name: "rule",
  description: govDesc.rule,
  kind: "write",
  targets: ["Organization"],
  inputs: [],
  outputs: ["charter"],
};

export const ESTABLISH: ProcessDefinition = {
  name: "establish",
  description: govDesc.establish,
  kind: "create",
  targets: ["Position"],
  inputs: [],
  outputs: ["duty"],
};

export const ABOLISH: ProcessDefinition = {
  name: "abolish",
  description: govDesc.abolish,
  kind: "write",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const ASSIGN: ProcessDefinition = {
  name: "assign",
  description: govDesc.assign,
  kind: "write",
  targets: ["Position"],
  inputs: [],
  outputs: ["duty"],
};

export const HIRE: ProcessDefinition = {
  name: "hire",
  description: govDesc.hire,
  kind: "relate",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

export const FIRE: ProcessDefinition = {
  name: "fire",
  description: govDesc.fire,
  kind: "relate",
  targets: ["Organization"],
  inputs: [],
  outputs: [],
};

export const APPOINT: ProcessDefinition = {
  name: "appoint",
  description: govDesc.appoint,
  kind: "relate",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const DISMISS: ProcessDefinition = {
  name: "dismiss",
  description: govDesc.dismiss,
  kind: "relate",
  targets: ["Position"],
  inputs: [],
  outputs: [],
};

export const DIRECTORY: ProcessDefinition = {
  name: "directory",
  description: govDesc.directory,
  kind: "query",
  targets: ["Organization"],
  inputs: ["charter", "duty"],
  outputs: [],
};

// ========== System ==========

export const ORG_LIFECYCLE: SystemDefinition = {
  name: "org-lifecycle",
  description: orgDesc.system,
  processes: ["found", "dissolve"],
  feedback: [],
};

export const GOVERNANCE: SystemDefinition = {
  name: "governance",
  description: govDesc.system,
  processes: [
    "rule",
    "establish",
    "abolish",
    "assign",
    "hire",
    "fire",
    "appoint",
    "dismiss",
    "directory",
  ],
  feedback: [],
};
