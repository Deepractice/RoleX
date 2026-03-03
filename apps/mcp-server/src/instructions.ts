/**
 * MCP server instructions — the cognitive framework for AI roles.
 *
 * Assembled from world .feature files in rolexjs descriptions.
 * Each feature describes one independent concern of the RoleX framework.
 */
import { world } from "rolexjs";

export const instructions = Object.values(world).join("\n\n");
