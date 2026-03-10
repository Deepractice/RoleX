/**
 * Commands — shared type definitions.
 */

import type { Runtime, State, Structure } from "@rolexjs/system";
import type { Comment, Issue, IssueX } from "issuexjs";
import type { Resource, ResourceX, RXM } from "resourcexjs";
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
  resourcex?: ResourceX;
  issuex?: IssueX;
  prototype?: PrototypeRepository;
  direct?(locator: string, args?: Record<string, unknown>): Promise<unknown>;
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

  // ---- Role: skill ----
  "role.skill": string;

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

  // ---- Census ----
  "census.list": CommandResult;

  // ---- Issue ----
  "issue.publish": Issue;
  "issue.get": Issue | null;
  "issue.list": Issue[];
  "issue.update": Issue;
  "issue.close": Issue;
  "issue.reopen": Issue;
  "issue.assign": Issue;
  "issue.comment": Comment;
  "issue.comments": Comment[];
  "issue.label": Issue | null;
  "issue.unlabel": Issue | null;

  // ---- Resource ----
  "resource.add": Resource;
  "resource.search": string[];
  "resource.has": boolean;
  "resource.info": Resource;
  "resource.remove": undefined;
  "resource.push": RXM;
  "resource.pull": undefined;
  "resource.clearCache": undefined;
}

export type Commands = Record<string, (...args: any[]) => any>;
