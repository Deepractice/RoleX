/**
 * Role System — external management of a role's lifecycle.
 *
 * These processes are done TO a role from the outside:
 * born → teach → train → retire → kill
 *
 * The role system creates, cultivates, and eventually
 * retires or destroys roles.
 */

import type { ProcessDefinition, SystemDefinition } from "@rolexjs/system";

import { role as desc } from "./descriptions/index.js";

// ========== Process ==========

export const BORN: ProcessDefinition = {
  name: "born",
  description: desc.born,
  kind: "create",
  targets: ["Role"],
  inputs: [],
  outputs: ["persona"],
};

export const TEACH: ProcessDefinition = {
  name: "teach",
  description: desc.teach,
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["knowledge.pattern"],
};

export const TRAIN: ProcessDefinition = {
  name: "train",
  description: desc.train,
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["knowledge.procedure"],
};

export const RETIRE: ProcessDefinition = {
  name: "retire",
  description: desc.retire,
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: [],
  consumes: ["Role"],
};

export const KILL: ProcessDefinition = {
  name: "kill",
  description: desc.kill,
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

// ========== System ==========

export const ROLE_LIFECYCLE: SystemDefinition = {
  name: "role-lifecycle",
  description: desc.system,
  processes: ["born", "teach", "train", "retire", "kill"],
  feedback: [],
};
