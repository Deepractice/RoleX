/**
 * Cucumber World
 * Shared context for all BDD step definitions
 * @rolexjs/bdd
 */

import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Registry, RXR, ResolvedResource } from "resourcexjs";
import type { RenderedRole } from "rolexjs";

export interface RoleXWorld extends World {
  // Registry
  registry: Registry | null;
  testDir: string;

  // Role resources
  roleFiles: Map<string, string>;
  roleLocator: string | null;
  currentRxr: RXR | null;

  // Results
  renderedRole: RenderedRole | null;
  resolvedResource: ResolvedResource | null;
  resolvedContent: string | null;
  serializedBuffer: Buffer | null;

  // Error handling
  error: Error | null;
}

class RoleXWorldImpl extends World implements RoleXWorld {
  registry: Registry | null = null;
  testDir: string = "";
  roleFiles: Map<string, string> = new Map();
  roleLocator: string | null = null;
  currentRxr: RXR | null = null;
  renderedRole: RenderedRole | null = null;
  resolvedResource: ResolvedResource | null = null;
  resolvedContent: string | null = null;
  serializedBuffer: Buffer | null = null;
  error: Error | null = null;

  constructor(options: ConstructorParameters<typeof World>[0]) {
    super(options);
  }
}

setWorldConstructor(RoleXWorldImpl);
