/**
 * RoleX Processes — all operations that change information.
 *
 * A process is the only way information changes in the system.
 * Categorized by what they do:
 *
 *   create    — bring a new structure into existence
 *   write     — add information to an existing structure
 *   transform — derive new information from existing information
 *   relate    — establish or remove relationships between structures
 *   query     — read information without changing anything
 */

import type { ProcessDefinition } from "@rolexjs/model";

// ========== create — new structures ==========

export const BORN: ProcessDefinition = {
  name: "born",
  description: "Create a role with initial persona.",
  kind: "create",
  targets: ["Role"],
  inputs: [],
  outputs: ["persona"],
};

export const FOUND: ProcessDefinition = {
  name: "found",
  description: "Create an organization with initial charter.",
  kind: "create",
  targets: ["Organization"],
  inputs: [],
  outputs: ["charter"],
};

export const ESTABLISH: ProcessDefinition = {
  name: "establish",
  description: "Create a position within an organization with duties.",
  kind: "create",
  targets: ["Position"],
  inputs: [],
  outputs: ["duty"],
};

// ========== write — add information ==========

export const TEACH: ProcessDefinition = {
  name: "teach",
  description:
    "Transmit a priori information to a role — knowledge, experience, or voice.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["knowledge", "experience", "voice"],
};

export const WANT: ProcessDefinition = {
  name: "want",
  description: "Declare a goal for the active role.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["goal"],
};

export const DESIGN: ProcessDefinition = {
  name: "plan",
  description: "Write a plan for the current goal.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["plan"],
};

export const TODO: ProcessDefinition = {
  name: "todo",
  description: "Create a task under the current goal.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["task"],
};

export const FINISH: ProcessDefinition = {
  name: "finish",
  description:
    "Mark a task complete. Optionally capture experience from the work.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["experience"],
};

export const ACHIEVE: ProcessDefinition = {
  name: "achieve",
  description:
    "Mark the current goal complete. Optionally capture experience.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["experience"],
};

export const ABANDON: ProcessDefinition = {
  name: "abandon",
  description:
    "Mark the current goal abandoned. Optionally capture experience.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["experience"],
};

// ========== transform — derive new information ==========

export const SYNTHESIZE: ProcessDefinition = {
  name: "synthesize",
  description:
    "Turn encounters into experience — a posteriori learning from what happened.",
  kind: "transform",
  targets: ["Role"],
  inputs: [],
  outputs: ["experience"],
};

export const REFLECT: ProcessDefinition = {
  name: "reflect",
  description:
    "Distill multiple experiences into knowledge — the cognitive upgrade path.",
  kind: "transform",
  targets: ["Role"],
  inputs: ["experience"],
  outputs: ["knowledge"],
};

// ========== relate — structure relationships ==========

export const HIRE: ProcessDefinition = {
  name: "hire",
  description: "Bring a role into an organization as a member.",
  kind: "relate",
  targets: ["Role", "Organization"],
  inputs: [],
  outputs: [],
};

export const FIRE: ProcessDefinition = {
  name: "fire",
  description: "Remove a role from an organization.",
  kind: "relate",
  targets: ["Role", "Organization"],
  inputs: [],
  outputs: [],
};

export const APPOINT: ProcessDefinition = {
  name: "appoint",
  description: "Assign a member to a position within the organization.",
  kind: "relate",
  targets: ["Role", "Position"],
  inputs: [],
  outputs: [],
};

export const DISMISS: ProcessDefinition = {
  name: "dismiss",
  description: "Remove a role from their position.",
  kind: "relate",
  targets: ["Role", "Position"],
  inputs: [],
  outputs: [],
};

export const EQUIP: ProcessDefinition = {
  name: "equip",
  description: "Equip a skill to a role — inject operational knowledge.",
  kind: "relate",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

export const UNEQUIP: ProcessDefinition = {
  name: "unequip",
  description: "Remove a skill from a role.",
  kind: "relate",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

// ========== query — read without changing ==========

export const IDENTITY: ProcessDefinition = {
  name: "identity",
  description: "Load and read a role's complete identity.",
  kind: "query",
  targets: ["Role"],
  inputs: ["persona", "knowledge", "experience", "voice", "duty", "skill"],
  outputs: [],
};

export const FOCUS: ProcessDefinition = {
  name: "focus",
  description: "Read the current goal with its plan and tasks.",
  kind: "query",
  targets: ["Role"],
  inputs: ["goal", "plan", "task"],
  outputs: [],
};

export const DIRECTORY: ProcessDefinition = {
  name: "directory",
  description: "List all roles, organizations, and skills in the society.",
  kind: "query",
  targets: ["Role", "Organization"],
  inputs: [],
  outputs: [],
};

export const PROCESSES: readonly ProcessDefinition[] = [
  // create
  BORN,
  FOUND,
  ESTABLISH,
  // write
  TEACH,
  WANT,
  DESIGN,
  TODO,
  FINISH,
  ACHIEVE,
  ABANDON,
  // transform
  SYNTHESIZE,
  REFLECT,
  // relate
  HIRE,
  FIRE,
  APPOINT,
  DISMISS,
  EQUIP,
  UNEQUIP,
  // query
  IDENTITY,
  FOCUS,
  DIRECTORY,
];
