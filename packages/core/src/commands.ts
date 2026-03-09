/**
 * Commands — platform-agnostic command implementations.
 *
 * Every RoleX command is a pure function of (Runtime, args) → CommandResult.
 * No platform-specific code — all I/O goes through injected interfaces.
 *
 * Usage:
 *   const commands = createCommands({ rt, society, past, resolve, find, resourcex });
 *   const result = commands["society.born"]("Feature: Sean", "sean");
 */

import { parse } from "@rolexjs/parser";
import type { Runtime, State, Structure } from "@rolexjs/system";
import { structure } from "@rolexjs/system";
import type { Comment, Issue, IssueX } from "issuexjs";
import type { Resource, ResourceX, RXM } from "resourcexjs";
import * as C from "./index.js";
import type { PrototypeRepository } from "./platform.js";

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
  "project.launch": CommandResult;
  "project.scope": CommandResult;
  "project.milestone": CommandResult;
  "project.achieve": CommandResult;
  "project.enroll": CommandResult;
  "project.remove": CommandResult;
  "project.deliver": CommandResult;
  "project.wiki": CommandResult;
  "project.archive": CommandResult;
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

  // ---- Position ----
  "position.establish": CommandResult;
  "position.charge": CommandResult;
  "position.require": CommandResult;
  "position.abolish": CommandResult;
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

// ================================================================
//  Factory
// ================================================================

export function createCommands(ctx: CommandContext): Commands {
  const { rt, society, past, resolve, resourcex, issuex } = ctx;

  // ---- Helpers ----

  async function ok(node: Structure, process: string): Promise<CommandResult> {
    return { state: await rt.project(node), process };
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

  // ================================================================
  //  Operations
  // ================================================================

  return {
    // ---- Society: individual lifecycle ----

    async "society.born"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.individual, content, id, alias);
      await rt.create(node, C.identity, undefined, `${id}-identity`);
      return ok(node, "born");
    },

    async "society.retire"(individual: string): Promise<CommandResult> {
      return archive(await resolve(individual), "retire");
    },

    async "society.die"(individual: string): Promise<CommandResult> {
      return archive(await resolve(individual), "die");
    },

    async "society.rehire"(pastNode: string): Promise<CommandResult> {
      const node = await resolve(pastNode);
      const ind = await rt.transform(node, C.individual);
      return ok(ind, "rehire");
    },

    // ---- Society: external injection ----

    async "society.teach"(
      individual: string,
      principle: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(principle);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.principle, principle, id);
      return ok(node, "teach");
    },

    async "society.train"(
      individual: string,
      procedure: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.procedure, procedure, id);
      return ok(node, "train");
    },

    // ---- Role: focus ----

    async "role.focus"(goal: string): Promise<CommandResult> {
      return ok(await resolve(goal), "focus");
    },

    // ---- Role: execution ----

    async "role.want"(
      individual: string,
      goal?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(goal);
      const node = await rt.create(await resolve(individual), C.goal, goal, id, alias);
      return ok(node, "want");
    },

    async "role.plan"(
      goal: string,
      plan?: string,
      id?: string,
      after?: string,
      fallback?: string
    ): Promise<CommandResult> {
      validateGherkin(plan);
      const node = await rt.create(await resolve(goal), C.plan, plan, id);
      if (after) await rt.link(node, await resolve(after), "after", "before");
      if (fallback) await rt.link(node, await resolve(fallback), "fallback-for", "fallback");
      return ok(node, "plan");
    },

    async "role.todo"(
      plan: string,
      task?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(task);
      const node = await rt.create(await resolve(plan), C.task, task, id, alias);
      return ok(node, "todo");
    },

    async "role.finish"(
      task: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const taskNode = await resolve(task);
      await rt.tag(taskNode, "done");
      if (encounter) {
        const encId = taskNode.id ? `${taskNode.id}-finished` : undefined;
        const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
        return ok(enc, "finish");
      }
      return ok(taskNode, "finish");
    },

    async "role.complete"(
      plan: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const planNode = await resolve(plan);
      await rt.tag(planNode, "done");
      const encId = planNode.id ? `${planNode.id}-completed` : undefined;
      const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "complete");
    },

    async "role.abandon"(
      plan: string,
      individual: string,
      encounter?: string
    ): Promise<CommandResult> {
      validateGherkin(encounter);
      const planNode = await resolve(plan);
      await rt.tag(planNode, "abandoned");
      const encId = planNode.id ? `${planNode.id}-abandoned` : undefined;
      const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "abandon");
    },

    // ---- Role: cognition ----

    async "role.reflect"(
      encounter: string | undefined,
      individual: string,
      experience?: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(experience);
      if (encounter) {
        const encNode = await resolve(encounter);
        const exp = await rt.create(
          await resolve(individual),
          C.experience,
          experience || encNode.information,
          id
        );
        await rt.remove(encNode);
        return ok(exp, "reflect");
      }
      // Direct creation — no encounter to consume
      const exp = await rt.create(await resolve(individual), C.experience, experience, id);
      return ok(exp, "reflect");
    },

    async "role.realize"(
      experience: string | undefined,
      individual: string,
      principle?: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(principle);
      if (experience) {
        const expNode = await resolve(experience);
        const prin = await rt.create(
          await resolve(individual),
          C.principle,
          principle || expNode.information,
          id
        );
        await rt.remove(expNode);
        return ok(prin, "realize");
      }
      // Direct creation — no experience to consume
      const prin = await rt.create(await resolve(individual), C.principle, principle, id);
      return ok(prin, "realize");
    },

    async "role.master"(
      individual: string,
      procedure: string,
      id?: string,
      experience?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const proc = await rt.create(parent, C.procedure, procedure, id);
      if (experience) await rt.remove(await resolve(experience));
      return ok(proc, "master");
    },

    // ---- Role: knowledge management ----

    async "role.forget"(nodeId: string): Promise<CommandResult> {
      const node = await resolve(nodeId);
      await rt.remove(node);
      return { state: { ...node, children: [] }, process: "forget" };
    },

    // ---- Role: skill ----

    async "role.skill"(locator: string): Promise<string> {
      const rx = requireResourceX();
      const content = await rx.ingest<string>(locator);
      const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
      try {
        const rxm = await rx.info(locator);
        return `${formatRXM(rxm)}\n\n${text}`;
      } catch {
        return text;
      }
    },

    // ---- Project ----

    async "project.launch"(
      content?: string,
      id?: string,
      alias?: readonly string[],
      org?: string
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.project, content, id, alias);
      if (org) await rt.link(node, await resolve(org), "ownership", "project");
      return ok(node, "launch");
    },

    async "project.scope"(project: string, scope: string, id?: string): Promise<CommandResult> {
      validateGherkin(scope);
      const node = await rt.create(await resolve(project), C.scope, scope, id);
      return ok(node, "scope");
    },

    async "project.milestone"(
      project: string,
      milestone: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(milestone);
      const node = await rt.create(await resolve(project), C.milestone, milestone, id);
      return ok(node, "milestone");
    },

    async "project.achieve"(milestone: string): Promise<CommandResult> {
      const node = await resolve(milestone);
      await rt.tag(node, "done");
      return ok(node, "achieve");
    },

    async "project.enroll"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.link(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "enroll");
    },

    async "project.remove"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.unlink(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "remove");
    },

    async "project.deliver"(
      project: string,
      deliverable: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(deliverable);
      const node = await rt.create(await resolve(project), C.deliverable, deliverable, id);
      return ok(node, "deliver");
    },

    async "project.wiki"(project: string, wiki: string, id?: string): Promise<CommandResult> {
      validateGherkin(wiki);
      const node = await rt.create(await resolve(project), C.wiki, wiki, id);
      return ok(node, "wiki");
    },

    async "project.archive"(project: string): Promise<CommandResult> {
      return archive(await resolve(project), "archive");
    },

    async "project.produce"(
      project: string,
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const projNode = await resolve(project);
      const node = await rt.create(society, C.product, content, id, alias);
      // Bidirectional link: project → product (production), product → project (origin)
      await rt.link(projNode, node, "production", "produce");
      await rt.link(node, projNode, "origin", "produced-by");
      return ok(node, "produce");
    },

    async "project.maintain"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.link(projNode, await resolve(individual), "maintain", "maintained-by");
      return ok(projNode, "maintain");
    },

    async "project.unmaintain"(project: string, individual: string): Promise<CommandResult> {
      const projNode = await resolve(project);
      await rt.unlink(projNode, await resolve(individual), "maintain", "maintained-by");
      return ok(projNode, "unmaintain");
    },

    // ---- Product ----

    async "product.strategy"(
      product: string,
      strategy: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(strategy);
      const node = await rt.create(await resolve(product), C.strategy, strategy, id);
      return ok(node, "strategy");
    },

    async "product.spec"(product: string, spec: string, id?: string): Promise<CommandResult> {
      validateGherkin(spec);
      const node = await rt.create(await resolve(product), C.spec, spec, id);
      return ok(node, "spec");
    },

    async "product.release"(product: string, release: string, id?: string): Promise<CommandResult> {
      validateGherkin(release);
      const node = await rt.create(await resolve(product), C.release, release, id);
      return ok(node, "release");
    },

    async "product.channel"(product: string, channel: string, id?: string): Promise<CommandResult> {
      validateGherkin(channel);
      const node = await rt.create(await resolve(product), C.channel, channel, id);
      return ok(node, "channel");
    },

    async "product.own"(product: string, individual: string): Promise<CommandResult> {
      const prodNode = await resolve(product);
      await rt.link(prodNode, await resolve(individual), "ownership", "own");
      return ok(prodNode, "own");
    },

    async "product.disown"(product: string, individual: string): Promise<CommandResult> {
      const prodNode = await resolve(product);
      await rt.unlink(prodNode, await resolve(individual), "ownership", "own");
      return ok(prodNode, "disown");
    },

    async "product.deprecate"(product: string): Promise<CommandResult> {
      return archive(await resolve(product), "deprecate");
    },

    // ---- Society: organization lifecycle ----

    async "society.found"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.organization, content, id, alias);
      return ok(node, "found");
    },

    async "society.dissolve"(org: string): Promise<CommandResult> {
      return archive(await resolve(org), "dissolve");
    },

    // ---- Org ----

    async "org.charter"(org: string, charter: string, id?: string): Promise<CommandResult> {
      validateGherkin(charter);
      const node = await rt.create(await resolve(org), C.charter, charter, id);
      return ok(node, "charter");
    },

    async "org.hire"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.link(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "hire");
    },

    async "org.fire"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.unlink(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "fire");
    },

    async "org.admin"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.link(orgNode, await resolve(individual), "admin", "administer");
      return ok(orgNode, "admin");
    },

    async "org.unadmin"(org: string, individual: string): Promise<CommandResult> {
      const orgNode = await resolve(org);
      await rt.unlink(orgNode, await resolve(individual), "admin", "administer");
      return ok(orgNode, "unadmin");
    },

    // ---- Position ----

    async "position.establish"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<CommandResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.position, content, id, alias);
      return ok(node, "establish");
    },

    async "position.charge"(position: string, duty: string, id?: string): Promise<CommandResult> {
      validateGherkin(duty);
      const node = await rt.create(await resolve(position), C.duty, duty, id);
      return ok(node, "charge");
    },

    async "position.require"(
      position: string,
      procedure: string,
      id?: string
    ): Promise<CommandResult> {
      validateGherkin(procedure);
      const parent = await resolve(position);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.requirement, procedure, id);
      return ok(node, "require");
    },

    async "position.abolish"(position: string): Promise<CommandResult> {
      return archive(await resolve(position), "abolish");
    },

    async "position.appoint"(position: string, individual: string): Promise<CommandResult> {
      const posNode = await resolve(position);
      const indNode = await resolve(individual);
      await rt.link(posNode, indNode, "appointment", "serve");
      return ok(posNode, "appoint");
    },

    async "position.dismiss"(position: string, individual: string): Promise<CommandResult> {
      const posNode = await resolve(position);
      await rt.unlink(posNode, await resolve(individual), "appointment", "serve");
      return ok(posNode, "dismiss");
    },

    // ---- Society ----

    async "society.crown"(individual: string): Promise<CommandResult> {
      const indNode = await resolve(individual);
      await rt.link(society, indNode, "crown", "crowned");
      return ok(indNode, "crown");
    },

    async "society.uncrown"(individual: string): Promise<CommandResult> {
      const indNode = await resolve(individual);
      await rt.unlink(society, indNode, "crown", "crowned");
      return ok(indNode, "uncrown");
    },

    // ---- Census ----

    async "census.list"(type?: string): Promise<CommandResult> {
      const target = type === "past" ? past : society;
      const state = await rt.project(target);
      const children = state.children ?? [];
      const filtered =
        type === "past"
          ? children
          : children.filter((c) => (type ? c.name === type : c.name !== "past"));
      return { state: { ...state, children: filtered }, process: "list" };
    },

    // ---- Resource (proxy to ResourceX) ----

    "resource.add"(path: string): Promise<Resource> {
      return requireResourceX().add(path);
    },

    "resource.search"(query?: string): Promise<string[]> {
      return requireResourceX().search(query);
    },

    "resource.has"(locator: string): Promise<boolean> {
      return requireResourceX().has(locator);
    },

    "resource.info"(locator: string): Promise<Resource> {
      return requireResourceX().info(locator);
    },

    "resource.remove"(locator: string): Promise<void> {
      return requireResourceX().remove(locator);
    },

    "resource.push"(locator: string, options?: { registry?: string }): Promise<RXM> {
      return requireResourceX().push(locator, options);
    },

    "resource.pull"(locator: string, options?: { registry?: string }): Promise<void> {
      return requireResourceX().pull(locator, options);
    },

    "resource.clearCache"(registry?: string): Promise<void> {
      return requireResourceX().clearCache(registry);
    },

    // ---- Issue (proxy to IssueX) ----

    async "issue.publish"(
      title: string,
      body: string,
      author: string,
      assignee?: string
    ): Promise<Issue> {
      const ix = requireIssueX();
      return ix.createIssue({ title, body, author, assignee });
    },

    async "issue.get"(number: number): Promise<Issue | null> {
      return requireIssueX().getIssueByNumber(number);
    },

    async "issue.list"(
      status?: string,
      author?: string,
      assignee?: string,
      label?: string
    ): Promise<Issue[]> {
      const filter: Record<string, string> = {};
      if (status) filter.status = status;
      if (author) filter.author = author;
      if (assignee) filter.assignee = assignee;
      if (label) filter.label = label;
      return requireIssueX().listIssues(
        Object.keys(filter).length > 0 ? (filter as any) : undefined
      );
    },

    async "issue.update"(
      number: number,
      title?: string,
      body?: string,
      assignee?: string
    ): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.title = title;
      if (body !== undefined) patch.body = body;
      if (assignee !== undefined) patch.assignee = assignee;
      return ix.updateIssue(issue.id, patch);
    },

    async "issue.close"(number: number): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.closeIssue(issue.id);
    },

    async "issue.reopen"(number: number): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.reopenIssue(issue.id);
    },

    async "issue.assign"(number: number, assignee: string): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.updateIssue(issue.id, { assignee });
    },

    async "issue.comment"(number: number, body: string, author: string): Promise<Comment> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.createComment(issue.id, body, author);
    },

    async "issue.comments"(number: number): Promise<Comment[]> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.listComments(issue.id);
    },

    async "issue.label"(number: number, label: string): Promise<Issue | null> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      // Find or create label by name
      let labelObj = await ix.getLabelByName(label);
      if (!labelObj) labelObj = await ix.createLabel({ name: label });
      await ix.addLabel(issue.id, labelObj.id);
      return ix.getIssueByNumber(number);
    },

    async "issue.unlabel"(number: number, label: string): Promise<Issue | null> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      const labelObj = await ix.getLabelByName(label);
      if (!labelObj) throw new Error(`Label "${label}" not found.`);
      await ix.removeLabel(issue.id, labelObj.id);
      return ix.getIssueByNumber(number);
    },
  };
}

// ================================================================
//  Helpers
// ================================================================

function formatRXM(rxm: any): string {
  const lines: string[] = [`--- RXM: ${rxm.locator} ---`];
  const def = rxm.definition;
  if (def) {
    if (def.author) lines.push(`Author: ${def.author}`);
    if (def.description) lines.push(`Description: ${def.description}`);
  }
  const source = rxm.source;
  if (source?.files) {
    lines.push("Files:");
    lines.push(renderFileTree(source.files, "  "));
  }
  lines.push("---");
  return lines.join("\n");
}

function renderFileTree(files: Record<string, any>, indent = ""): string {
  const lines: string[] = [];
  for (const [name, value] of Object.entries(files)) {
    if (value && typeof value === "object" && !("size" in value)) {
      lines.push(`${indent}${name}`);
      lines.push(renderFileTree(value, `${indent}  `));
    } else {
      const size = value?.size ? ` (${value.size} bytes)` : "";
      lines.push(`${indent}${name}${size}`);
    }
  }
  return lines.filter(Boolean).join("\n");
}
