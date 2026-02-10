/**
 * createRolex — the entry point.
 *
 * Wires Platform + ResourceX into all four systems.
 * MCP server only needs `individual`.
 */

import {
  createRoleSystem,
  createIndividualSystem,
  createOrgSystem,
  createGovernanceSystem,
} from "@rolexjs/core";
import type { Platform } from "@rolexjs/core";
import type { RunnableSystem } from "@rolexjs/system";
import type { Feature } from "@rolexjs/core";
import type { ResourceX } from "resourcexjs";
import { base } from "./base/index.js";

export interface RolexConfig {
  /** Storage platform (Structure, Information, Relation). */
  platform: Platform;
  /** Optional ResourceX instance for tool execution via `use`. */
  resourcex?: ResourceX;
}

export interface Rolex {
  /** First-person cognitive lifecycle (12 processes). MCP exposes this. */
  readonly individual: RunnableSystem<Feature>;
  /** External role lifecycle: born, teach, train, retire, kill. */
  readonly role: RunnableSystem<Feature>;
  /** External org lifecycle: found, dissolve. */
  readonly org: RunnableSystem<Feature>;
  /** Internal org governance: rule, establish, hire, appoint, etc. */
  readonly governance: RunnableSystem<Feature>;
}

/** Create all four systems from a single config. */
export function createRolex(config: RolexConfig): Rolex {
  const { platform, resourcex } = config;
  return {
    individual: createIndividualSystem(platform, resourcex, base),
    role: createRoleSystem(platform),
    org: createOrgSystem(platform),
    governance: createGovernanceSystem(platform),
  };
}
