/**
 * MCP server instructions — the cognitive framework for AI roles.
 *
 * Assembled from Gherkin .feature files in src/descriptions/.
 * Each feature describes a facet of the RoleX cognitive framework.
 *
 * Run `bun run gen:desc` to regenerate descriptions/index.ts from .feature files.
 */
import { world } from "./descriptions/index.js";

export const instructions = [
  world.rolex,
  world.execution,
  world.cognition,
  world.memory,
  world.gherkin,
].join("\n\n");
