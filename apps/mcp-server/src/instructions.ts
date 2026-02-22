/**
 * MCP server instructions — the cognitive framework for AI roles.
 *
 * Assembled from world .feature files in rolexjs descriptions.
 * Each feature describes one independent concern of the RoleX framework.
 */
import { world } from "rolexjs";

export const instructions = [
  world["cognitive-priority"],
  world["role-identity"],
  world.execution,
  world.cognition,
  world.memory,
  world.gherkin,
  world.communication,
  world["skill-system"],
  world["state-origin"],
].join("\n\n");
