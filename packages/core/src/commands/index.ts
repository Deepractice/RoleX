/**
 * Commands — platform-agnostic command implementations.
 *
 * Every RoleX command is a pure function of (Runtime, args) -> CommandResult.
 * No platform-specific code — all I/O goes through injected interfaces.
 *
 * Usage:
 *   const commands = createCommands({ rt, society, past, resolve, find, resourcex });
 *   const result = commands["society.born"]("Feature: Sean", "sean");
 */

import { censusCommands } from "./census.js";
import { createHelpers } from "./helpers.js";
import { issueCommands } from "./issue.js";
import { positionCommands } from "./position.js";
import { productCommands } from "./product.js";
import { projectCommands } from "./project.js";
import { resourceCommands } from "./resource.js";
import { roleCommands } from "./role.js";
import { societyCommands } from "./society.js";
import type { CommandContext, Commands } from "./types.js";

export type { CommandContext, CommandResult, CommandResultMap, Commands } from "./types.js";

export function createCommands(ctx: CommandContext): Commands {
  const helpers = createHelpers(ctx);
  return {
    ...societyCommands(ctx, helpers),
    ...roleCommands(ctx, helpers),
    ...positionCommands(ctx, helpers),
    ...projectCommands(ctx, helpers),
    ...productCommands(ctx, helpers),
    ...censusCommands(ctx, helpers),
    ...resourceCommands(ctx, helpers),
    ...issueCommands(ctx, helpers),
  };
}
