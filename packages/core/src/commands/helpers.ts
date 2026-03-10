/**
 * Commands — shared helpers used across all command sub-modules.
 */

import { parse } from "@rolexjs/parser";
import type { State, Structure } from "@rolexjs/system";
import { structure } from "@rolexjs/system";
import type { IssueX } from "issuexjs";
import type { ResourceX } from "resourcexjs";
import * as C from "../structures.js";
import type { CommandContext, CommandResult } from "./types.js";

// ================================================================
//  Helpers interface
// ================================================================

export interface Helpers {
  ok(node: Structure, process: string): Promise<CommandResult>;
  archive(node: Structure, process: string): Promise<CommandResult>;
  validateGherkin(source?: string): void;
  removeExisting(parent: Structure, id: string): Promise<void>;
  requireResourceX(): ResourceX;
  requireIssueX(): IssueX;
}

// ================================================================
//  Scoped search
// ================================================================

/** Scoped search within a subtree. No priority needed — used only by removeExisting. */
function findInState(state: State, target: string): Structure | null {
  if (state.id && state.id.toLowerCase() === target) return state;
  if (state.alias) {
    for (const a of state.alias) {
      if (a.toLowerCase() === target) return state;
    }
  }
  for (const child of state.children ?? []) {
    const found = findInState(child, target);
    if (found) return found;
  }
  return null;
}

// ================================================================
//  Factory
// ================================================================

export function createHelpers(ctx: CommandContext): Helpers {
  const { rt, project, resourcex, issuex } = ctx;

  async function ok(node: Structure, process: string): Promise<CommandResult> {
    return { state: await project(node), process };
  }

  async function archive(node: Structure, process: string): Promise<CommandResult> {
    // Move the node into the past container, keeping its original name
    const target = structure(node.name, node.description ?? "", C.past);
    const archived = await rt.transform(node, target);
    return ok(archived, process);
  }

  function validateGherkin(source?: string): void {
    if (!source) return;
    try {
      parse(source);
    } catch (e: any) {
      throw new Error(`Invalid Gherkin: ${e.message}`);
    }
  }

  async function removeExisting(parent: Structure, id: string): Promise<void> {
    const state = await rt.project(parent);
    const existing = findInState(state, id);
    if (existing) await rt.remove(existing);
  }

  function requireResourceX(): ResourceX {
    if (!resourcex) throw new Error("ResourceX is not available.");
    return resourcex;
  }

  function requireIssueX(): IssueX {
    if (!issuex) throw new Error("IssueX is not available.");
    return issuex;
  }

  return { ok, archive, validateGherkin, removeExisting, requireResourceX, requireIssueX };
}
