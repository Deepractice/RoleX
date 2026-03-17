/**
 * Namespace interfaces and factories for RoleX builder API.
 *
 * Each namespace is a typed wrapper over the JSON-RPC caller function.
 * Methods accept named parameter objects (matching JSON-RPC params)
 * and return typed results.
 */

import type { CommandResult } from "./commands/types.js";
import type { Role } from "./role-model.js";

// ================================================================
//  Caller — the abstraction all namespaces depend on
// ================================================================

// biome-ignore lint: Caller uses any for transport-layer flexibility
export type Caller = (method: string, params?: Record<string, unknown>) => Promise<any>;

// ================================================================
//  Society
// ================================================================

export interface SocietyNamespace {
  born(params: { content?: string; id: string; alias?: string[] }): Promise<CommandResult>;
  retire(params: { individual: string }): Promise<CommandResult>;
  die(params: { individual: string }): Promise<CommandResult>;
  rehire(params: { individual: string }): Promise<CommandResult>;
  teach(params: { individual: string; content: string; id: string }): Promise<CommandResult>;
  train(params: { individual: string; content: string; id: string }): Promise<CommandResult>;
  found(params: {
    content?: string;
    id: string;
    alias?: string[];
    admin?: string;
  }): Promise<CommandResult>;
  dissolve(params: { org: string }): Promise<CommandResult>;
  crown(params: { individual: string }): Promise<CommandResult>;
  uncrown(params: { individual: string }): Promise<CommandResult>;
}

export function createSocietyNamespace(call: Caller): SocietyNamespace {
  return {
    born: (p) => call("society.born", p),
    retire: (p) => call("society.retire", p),
    die: (p) => call("society.die", p),
    rehire: (p) => call("society.rehire", p),
    teach: (p) => call("society.teach", p),
    train: (p) => call("society.train", p),
    found: (p) => call("society.found", p),
    dissolve: (p) => call("society.dissolve", p),
    crown: (p) => call("society.crown", p),
    uncrown: (p) => call("society.uncrown", p),
  };
}

// ================================================================
//  Individual
// ================================================================

export interface IndividualNamespace {
  activate(params: { individual: string }): Promise<Role>;
}

export function createIndividualNamespace(call: Caller): IndividualNamespace {
  return {
    activate: (p) => call("role.activate", p),
  };
}

// ================================================================
//  Org
// ================================================================

export interface OrgNamespace {
  charter(params: { org: string; content: string; id: string }): Promise<CommandResult>;
  hire(params: { org: string; individual: string }): Promise<CommandResult>;
  fire(params: { org: string; individual: string }): Promise<CommandResult>;
  admin(params: { org: string; individual: string }): Promise<CommandResult>;
  unadmin(params: { org: string; individual: string }): Promise<CommandResult>;
  launch(params: {
    content?: string;
    id: string;
    alias?: string[];
    org?: string;
    maintainer?: string;
  }): Promise<CommandResult>;
  archive(params: { project: string }): Promise<CommandResult>;
  establish(params: { content?: string; id: string; alias?: string[] }): Promise<CommandResult>;
  abolish(params: { position: string }): Promise<CommandResult>;
}

export function createOrgNamespace(call: Caller): OrgNamespace {
  return {
    charter: (p) => call("org.charter", p),
    hire: (p) => call("org.hire", p),
    fire: (p) => call("org.fire", p),
    admin: (p) => call("org.admin", p),
    unadmin: (p) => call("org.unadmin", p),
    launch: (p) => call("org.launch", p),
    archive: (p) => call("org.archive", p),
    establish: (p) => call("org.establish", p),
    abolish: (p) => call("org.abolish", p),
  };
}

// ================================================================
//  Position
// ================================================================

export interface PositionNamespace {
  charge(params: { position: string; content: string; id: string }): Promise<CommandResult>;
  require(params: { position: string; content: string; id: string }): Promise<CommandResult>;
  appoint(params: { position: string; individual: string }): Promise<CommandResult>;
  dismiss(params: { position: string; individual: string }): Promise<CommandResult>;
}

export function createPositionNamespace(call: Caller): PositionNamespace {
  return {
    charge: (p) => call("position.charge", p),
    require: (p) => call("position.require", p),
    appoint: (p) => call("position.appoint", p),
    dismiss: (p) => call("position.dismiss", p),
  };
}

// ================================================================
//  Project
// ================================================================

export interface ProjectNamespace {
  scope(params: { project: string; content: string; id: string }): Promise<CommandResult>;
  milestone(params: { project: string; content: string; id: string }): Promise<CommandResult>;
  achieve(params: { milestone: string }): Promise<CommandResult>;
  enroll(params: { project: string; individual: string }): Promise<CommandResult>;
  remove(params: { project: string; individual: string }): Promise<CommandResult>;
  deliver(params: { project: string; content: string; id: string }): Promise<CommandResult>;
  wiki(params: { project: string; content: string; id: string }): Promise<CommandResult>;
  produce(params: {
    project: string;
    content?: string;
    id: string;
    alias?: string[];
    owner?: string;
  }): Promise<CommandResult>;
  maintain(params: { project: string; individual: string }): Promise<CommandResult>;
  unmaintain(params: { project: string; individual: string }): Promise<CommandResult>;
}

export function createProjectNamespace(call: Caller): ProjectNamespace {
  return {
    scope: (p) => call("project.scope", p),
    milestone: (p) => call("project.milestone", p),
    achieve: (p) => call("project.achieve", p),
    enroll: (p) => call("project.enroll", p),
    remove: (p) => call("project.remove", p),
    deliver: (p) => call("project.deliver", p),
    wiki: (p) => call("project.wiki", p),
    produce: (p) => call("project.produce", p),
    maintain: (p) => call("project.maintain", p),
    unmaintain: (p) => call("project.unmaintain", p),
  };
}

// ================================================================
//  Product
// ================================================================

export interface ProductNamespace {
  strategy(params: { product: string; content: string; id: string }): Promise<CommandResult>;
  spec(params: { product: string; content: string; id: string }): Promise<CommandResult>;
  release(params: { product: string; content: string; id: string }): Promise<CommandResult>;
  channel(params: { product: string; content: string; id: string }): Promise<CommandResult>;
  own(params: { product: string; individual: string }): Promise<CommandResult>;
  disown(params: { product: string; individual: string }): Promise<CommandResult>;
  deprecate(params: { product: string }): Promise<CommandResult>;
}

export function createProductNamespace(call: Caller): ProductNamespace {
  return {
    strategy: (p) => call("product.strategy", p),
    spec: (p) => call("product.spec", p),
    release: (p) => call("product.release", p),
    channel: (p) => call("product.channel", p),
    own: (p) => call("product.own", p),
    disown: (p) => call("product.disown", p),
    deprecate: (p) => call("product.deprecate", p),
  };
}

// ================================================================
//  Issue
// ================================================================

export interface IssueNamespace {
  publish(params: {
    title: string;
    body: string;
    author: string;
    assignee?: string;
  }): Promise<CommandResult>;
  get(params: { number: number }): Promise<CommandResult>;
  list(params?: {
    status?: string;
    author?: string;
    assignee?: string;
    label?: string;
  }): Promise<CommandResult>;
  update(params: {
    number: number;
    title?: string;
    body?: string;
    assignee?: string;
  }): Promise<CommandResult>;
  close(params: { number: number }): Promise<CommandResult>;
  reopen(params: { number: number }): Promise<CommandResult>;
  assign(params: { number: number; assignee: string }): Promise<CommandResult>;
  comment(params: { number: number; body: string; author: string }): Promise<CommandResult>;
  comments(params: { number: number }): Promise<CommandResult>;
  label(params: { number: number; label: string }): Promise<CommandResult>;
  unlabel(params: { number: number; label: string }): Promise<CommandResult>;
}

export function createIssueNamespace(call: Caller): IssueNamespace {
  return {
    publish: (p) => call("issue.publish", p),
    get: (p) => call("issue.get", p),
    list: (p) => call("issue.list", p),
    update: (p) => call("issue.update", p),
    close: (p) => call("issue.close", p),
    reopen: (p) => call("issue.reopen", p),
    assign: (p) => call("issue.assign", p),
    comment: (p) => call("issue.comment", p),
    comments: (p) => call("issue.comments", p),
    label: (p) => call("issue.label", p),
    unlabel: (p) => call("issue.unlabel", p),
  };
}
