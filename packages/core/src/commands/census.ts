/**
 * Commands — census.* commands.
 */

import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

export function censusCommands(
  ctx: CommandContext,
  _helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { past, project } = ctx;
  // society is used via ctx to avoid shadowing with structure names
  const societyNode = ctx.society;

  return {
    async "census.list"(type?: string): Promise<CommandResult> {
      const target = type === "past" ? past : societyNode;
      const state = await project(target);
      const children = state.children ?? [];
      const filtered =
        type === "past"
          ? children
          : children.filter((c) => (type ? c.name === type : c.name !== "past"));
      return { state: { ...state, children: filtered }, process: "list" };
    },
  };
}
