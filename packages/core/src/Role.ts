/**
 * Role System — external management of a role's lifecycle.
 *
 * These processes are done TO a role from the outside:
 * born → teach → train → retire → kill
 *
 * The role system creates, cultivates, and eventually
 * retires or destroys roles.
 */

import type {
  ProcessDefinition,
  SystemDefinition,
} from "@rolexjs/system";

// ========== Process ==========

export const BORN: ProcessDefinition = {
  name: "born",
  description: "Create a role with initial persona.",
  kind: "create",
  targets: ["Role"],
  inputs: [],
  outputs: ["persona"],
};

export const TEACH: ProcessDefinition = {
  name: "teach",
  description: "Transmit declarative knowledge to a role.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["knowledge"],
};

export const TRAIN: ProcessDefinition = {
  name: "train",
  description: "Train procedural knowledge — teach the role how to do something.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: ["procedure"],
};

export const RETIRE: ProcessDefinition = {
  name: "retire",
  description: "Archive a role — deactivate but preserve all data.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

export const KILL: ProcessDefinition = {
  name: "kill",
  description: "Permanently destroy a role and all its data.",
  kind: "write",
  targets: ["Role"],
  inputs: [],
  outputs: [],
};

// ========== System ==========

export const ROLE_LIFECYCLE: SystemDefinition = {
  name: "role-lifecycle",
  description: "The external management cycle — create, cultivate, retire, destroy.",
  processes: ["born", "teach", "train", "retire", "kill"],
  feedback: [],
};
