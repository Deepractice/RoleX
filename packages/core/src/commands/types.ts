/**
 * Commands — shared type definitions.
 */

import type { Runtime, State, Structure } from "@rolexjs/system";
import type { PrototypeRepository } from "../platform.js";
import type { Projection } from "../projection.js";

// ================================================================
//  Types
// ================================================================

export interface CommandResult {
  state: State;
  process: string;
}

export interface CommandContext {
  rt: Runtime;
  society: Structure;
  past: Structure;
  resolve(id: string): Structure | Promise<Structure>;
  find(id: string): (Structure | null) | Promise<Structure | null>;
  project: Projection;
  prototype?: PrototypeRepository;
}

/**
 * CommandResultMap — typed return type for every command.
 *
 * This is the source of truth for what each command returns.
 * Renderer and consumers use this to know the shape of each result.
 */
export interface CommandResultMap {
  // ---- Society: individual lifecycle ----
  "society.born": CommandResult;
  "society.retire": CommandResult;
  "society.die": CommandResult;
  "society.rehire": CommandResult;
  "society.teach": CommandResult;
  "society.train": CommandResult;

  // ---- Role: focus ----
  "role.focus": CommandResult;

  // ---- Role: execution ----
  "role.want": CommandResult;
  "role.plan": CommandResult;
  "role.todo": CommandResult;
  "role.finish": CommandResult;
  "role.complete": CommandResult;
  "role.abandon": CommandResult;

  // ---- Role: cognition ----
  "role.reflect": CommandResult;
  "role.realize": CommandResult;
  "role.master": CommandResult;

  // ---- Role: knowledge ----
  "role.forget": CommandResult;

  // ---- Project ----
  "project.scope": CommandResult;
  "project.milestone": CommandResult;
  "project.achieve": CommandResult;
  "project.enroll": CommandResult;
  "project.remove": CommandResult;
  "project.deliver": CommandResult;
  "project.wiki": CommandResult;
  "project.produce": CommandResult;
  "project.maintain": CommandResult;
  "project.unmaintain": CommandResult;

  // ---- Product ----
  "product.strategy": CommandResult;
  "product.spec": CommandResult;
  "product.release": CommandResult;
  "product.channel": CommandResult;
  "product.own": CommandResult;
  "product.disown": CommandResult;
  "product.deprecate": CommandResult;

  // ---- Society: organization lifecycle ----
  "society.found": CommandResult;
  // ---- Organization ----
  "org.charter": CommandResult;
  "society.dissolve": CommandResult;
  "org.hire": CommandResult;
  "org.fire": CommandResult;
  "org.admin": CommandResult;
  "org.unadmin": CommandResult;
  "org.launch": CommandResult;
  "org.archive": CommandResult;
  "org.establish": CommandResult;
  "org.abolish": CommandResult;

  // ---- Position ----
  "position.charge": CommandResult;
  "position.require": CommandResult;
  "position.appoint": CommandResult;
  "position.dismiss": CommandResult;

  // ---- Society ----
  "society.crown": CommandResult;
  "society.uncrown": CommandResult;

  // ---- Survey ----
  "survey.list": CommandResult;

  // ---- Issue ----
  "issue.publish": CommandResult;
  "issue.get": CommandResult;
  "issue.list": CommandResult;
  "issue.update": CommandResult;
  "issue.close": CommandResult;
  "issue.reopen": CommandResult;
  "issue.assign": CommandResult;
  "issue.comment": CommandResult;
  "issue.comments": CommandResult;
  "issue.label": CommandResult;
  "issue.unlabel": CommandResult;
}

export type Commands = Record<string, (...args: any[]) => any>;
