/**
 * Ops — platform-agnostic operation implementations.
 *
 * Every RoleX operation is a pure function of (Runtime, args) → OpResult.
 * No platform-specific code — all I/O goes through injected interfaces.
 *
 * Usage:
 *   const ops = createOps({ rt, society, past, resolve, find, resourcex });
 *   const result = ops["individual.born"]("Feature: Sean", "sean");
 */

import type { PrototypeRepository } from "@rolexjs/core";
import * as C from "@rolexjs/core";
import { parse } from "@rolexjs/parser";
import type { Runtime, State, Structure } from "@rolexjs/system";
import type { IssueX } from "issuexjs";
import type { ResourceX } from "resourcexjs";

// ================================================================
//  Types
// ================================================================

export interface OpResult {
  state: State;
  process: string;
}

export interface OpsContext {
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

// biome-ignore lint/suspicious/noExplicitAny: ops are dynamically dispatched
export type Ops = Record<string, (...args: any[]) => any>;

// ================================================================
//  Factory
// ================================================================

export function createOps(ctx: OpsContext): Ops {
  const { rt, society, past, resolve, resourcex, issuex } = ctx;

  // ---- Helpers ----

  async function ok(node: Structure, process: string): Promise<OpResult> {
    return { state: await rt.project(node), process };
  }

  async function archive(node: Structure, process: string): Promise<OpResult> {
    const archived = await rt.transform(node, C.past);
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
    // ---- Individual: lifecycle ----

    async "individual.born"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<OpResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.individual, content, id, alias);
      await rt.create(node, C.identity, undefined, id ? `${id}-identity` : undefined);
      return ok(node, "born");
    },

    async "individual.retire"(individual: string): Promise<OpResult> {
      return archive(await resolve(individual), "retire");
    },

    async "individual.die"(individual: string): Promise<OpResult> {
      return archive(await resolve(individual), "die");
    },

    async "individual.rehire"(pastNode: string): Promise<OpResult> {
      const node = await resolve(pastNode);
      const ind = await rt.transform(node, C.individual);
      return ok(ind, "rehire");
    },

    // ---- Individual: external injection ----

    async "individual.teach"(
      individual: string,
      principle: string,
      id?: string
    ): Promise<OpResult> {
      validateGherkin(principle);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.principle, principle, id);
      return ok(node, "teach");
    },

    async "individual.train"(
      individual: string,
      procedure: string,
      id?: string
    ): Promise<OpResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.procedure, procedure, id);
      return ok(node, "train");
    },

    // ---- Role: focus ----

    async "role.focus"(goal: string): Promise<OpResult> {
      return ok(await resolve(goal), "focus");
    },

    // ---- Role: execution ----

    async "role.want"(
      individual: string,
      goal?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<OpResult> {
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
    ): Promise<OpResult> {
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
    ): Promise<OpResult> {
      validateGherkin(task);
      const node = await rt.create(await resolve(plan), C.task, task, id, alias);
      return ok(node, "todo");
    },

    async "role.finish"(task: string, individual: string, encounter?: string): Promise<OpResult> {
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

    async "role.complete"(plan: string, individual: string, encounter?: string): Promise<OpResult> {
      validateGherkin(encounter);
      const planNode = await resolve(plan);
      await rt.tag(planNode, "done");
      const encId = planNode.id ? `${planNode.id}-completed` : undefined;
      const enc = await rt.create(await resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "complete");
    },

    async "role.abandon"(plan: string, individual: string, encounter?: string): Promise<OpResult> {
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
    ): Promise<OpResult> {
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
    ): Promise<OpResult> {
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
    ): Promise<OpResult> {
      validateGherkin(procedure);
      const parent = await resolve(individual);
      if (id) await removeExisting(parent, id);
      const proc = await rt.create(parent, C.procedure, procedure, id);
      if (experience) await rt.remove(await resolve(experience));
      return ok(proc, "master");
    },

    // ---- Role: knowledge management ----

    async "role.forget"(nodeId: string): Promise<OpResult> {
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
    ): Promise<OpResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.project, content, id, alias);
      if (org) await rt.link(node, await resolve(org), "ownership", "project");
      return ok(node, "launch");
    },

    async "project.scope"(project: string, scope: string, id?: string): Promise<OpResult> {
      validateGherkin(scope);
      const node = await rt.create(await resolve(project), C.scope, scope, id);
      return ok(node, "scope");
    },

    async "project.milestone"(project: string, milestone: string, id?: string): Promise<OpResult> {
      validateGherkin(milestone);
      const node = await rt.create(await resolve(project), C.milestone, milestone, id);
      return ok(node, "milestone");
    },

    async "project.achieve"(milestone: string): Promise<OpResult> {
      const node = await resolve(milestone);
      await rt.tag(node, "done");
      return ok(node, "achieve");
    },

    async "project.enroll"(project: string, individual: string): Promise<OpResult> {
      const projNode = await resolve(project);
      await rt.link(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "enroll");
    },

    async "project.remove"(project: string, individual: string): Promise<OpResult> {
      const projNode = await resolve(project);
      await rt.unlink(projNode, await resolve(individual), "participation", "participate");
      return ok(projNode, "remove");
    },

    async "project.deliver"(project: string, deliverable: string, id?: string): Promise<OpResult> {
      validateGherkin(deliverable);
      const node = await rt.create(await resolve(project), C.deliverable, deliverable, id);
      return ok(node, "deliver");
    },

    async "project.wiki"(project: string, wiki: string, id?: string): Promise<OpResult> {
      validateGherkin(wiki);
      const node = await rt.create(await resolve(project), C.wiki, wiki, id);
      return ok(node, "wiki");
    },

    async "project.archive"(project: string): Promise<OpResult> {
      return archive(await resolve(project), "archive");
    },

    // ---- Org ----

    async "org.found"(content?: string, id?: string, alias?: readonly string[]): Promise<OpResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.organization, content, id, alias);
      return ok(node, "found");
    },

    async "org.charter"(org: string, charter: string, id?: string): Promise<OpResult> {
      validateGherkin(charter);
      const node = await rt.create(await resolve(org), C.charter, charter, id);
      return ok(node, "charter");
    },

    async "org.dissolve"(org: string): Promise<OpResult> {
      return archive(await resolve(org), "dissolve");
    },

    async "org.hire"(org: string, individual: string): Promise<OpResult> {
      const orgNode = await resolve(org);
      await rt.link(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "hire");
    },

    async "org.fire"(org: string, individual: string): Promise<OpResult> {
      const orgNode = await resolve(org);
      await rt.unlink(orgNode, await resolve(individual), "membership", "belong");
      return ok(orgNode, "fire");
    },

    // ---- Position ----

    async "position.establish"(
      content?: string,
      id?: string,
      alias?: readonly string[]
    ): Promise<OpResult> {
      validateGherkin(content);
      const node = await rt.create(society, C.position, content, id, alias);
      return ok(node, "establish");
    },

    async "position.charge"(position: string, duty: string, id?: string): Promise<OpResult> {
      validateGherkin(duty);
      const node = await rt.create(await resolve(position), C.duty, duty, id);
      return ok(node, "charge");
    },

    async "position.require"(position: string, procedure: string, id?: string): Promise<OpResult> {
      validateGherkin(procedure);
      const parent = await resolve(position);
      if (id) await removeExisting(parent, id);
      const node = await rt.create(parent, C.requirement, procedure, id);
      return ok(node, "require");
    },

    async "position.abolish"(position: string): Promise<OpResult> {
      return archive(await resolve(position), "abolish");
    },

    async "position.appoint"(position: string, individual: string): Promise<OpResult> {
      const posNode = await resolve(position);
      const indNode = await resolve(individual);
      await rt.link(posNode, indNode, "appointment", "serve");

      // Auto-train: copy position requirements as individual procedures
      const posState = await rt.project(posNode);
      for (const child of posState.children ?? []) {
        if (child.name !== "requirement" || !child.information) continue;
        // rt.create is idempotent for same parent + same id
        await rt.create(indNode, C.procedure, child.information, child.id);
      }

      return ok(posNode, "appoint");
    },

    async "position.dismiss"(position: string, individual: string): Promise<OpResult> {
      const posNode = await resolve(position);
      await rt.unlink(posNode, await resolve(individual), "appointment", "serve");
      return ok(posNode, "dismiss");
    },

    // ---- Census ----

    async "census.list"(type?: string): Promise<string> {
      const target = type === "past" ? past : society;
      const state = await rt.project(target);
      const children = state.children ?? [];
      const filtered =
        type === "past"
          ? children
          : children.filter((c) => (type ? c.name === type : c.name !== "past"));
      if (filtered.length === 0) {
        return type ? `No ${type} found.` : "Society is empty.";
      }

      // If filtering by type, use simple flat rendering
      if (type) {
        const lines: string[] = [];
        for (const item of filtered) {
          const tag = item.tag ? ` #${item.tag}` : "";
          const alias = item.alias?.length ? ` (${item.alias.join(", ")})` : "";
          lines.push(`${item.id ?? "(no id)"}${alias}${tag}`);
        }
        return lines.join("\n");
      }

      // Organization-centric tree view
      const orgs = filtered.filter((c) => c.name === "organization");
      const individuals = filtered.filter((c) => c.name === "individual");

      // Build a set of individuals who belong to an org
      const affiliatedIndividuals = new Set<string>();
      // Build a map: individual id → positions they serve
      const individualPositions = new Map<string, string[]>();
      for (const ind of individuals) {
        const serves = ind.links?.filter((l) => l.relation === "serve") ?? [];
        if (serves.length > 0) {
          individualPositions.set(
            ind.id ?? "",
            serves.map((l) => l.target.id ?? "(no id)")
          );
        }
      }

      const lines: string[] = [];

      for (const org of orgs) {
        const alias = org.alias?.length ? ` (${org.alias.join(", ")})` : "";
        const tag = org.tag ? ` #${org.tag}` : "";
        lines.push(`${org.id}${alias}${tag}`);

        // Projects owned by this org
        const projects = org.links?.filter((l) => l.relation === "project") ?? [];
        for (const p of projects) {
          const pAlias = p.target.alias?.length ? ` (${p.target.alias.join(", ")})` : "";
          const pTag = p.target.tag ? ` #${p.target.tag}` : "";
          lines.push(`  📦 ${p.target.id ?? "(no id)"}${pAlias}${pTag}`);
        }

        // Members of this org
        const members = org.links?.filter((l) => l.relation === "membership") ?? [];
        if (members.length === 0 && projects.length === 0) {
          lines.push("  (empty)");
        }
        for (const m of members) {
          affiliatedIndividuals.add(m.target.id ?? "");
          const mAlias = m.target.alias?.length ? ` (${m.target.alias.join(", ")})` : "";
          const mTag = m.target.tag ? ` #${m.target.tag}` : "";
          const posLabels = individualPositions.get(m.target.id ?? "");
          const posStr = posLabels?.length ? ` — ${posLabels.join(", ")}` : "";
          lines.push(`  ${m.target.id}${mAlias}${mTag}${posStr}`);
        }
        lines.push("");
      }

      // Unaffiliated individuals
      const unaffiliated = individuals.filter((ind) => !affiliatedIndividuals.has(ind.id ?? ""));
      if (unaffiliated.length > 0) {
        lines.push("─── unaffiliated ───");
        for (const ind of unaffiliated) {
          const alias = ind.alias?.length ? ` (${ind.alias.join(", ")})` : "";
          const tag = ind.tag ? ` #${ind.tag}` : "";
          const posLabels = individualPositions.get(ind.id ?? "");
          const posStr = posLabels?.length ? ` — ${posLabels.join(", ")}` : "";
          lines.push(`  ${ind.id}${alias}${tag}${posStr}`);
        }
      }

      return lines.join("\n");
    },

    // ---- Resource (proxy to ResourceX) ----

    "resource.add"(path: string) {
      return requireResourceX().add(path);
    },

    "resource.search"(query?: string) {
      return requireResourceX().search(query);
    },

    "resource.has"(locator: string) {
      return requireResourceX().has(locator);
    },

    "resource.info"(locator: string) {
      return requireResourceX().info(locator);
    },

    "resource.remove"(locator: string) {
      return requireResourceX().remove(locator);
    },

    "resource.push"(locator: string, options?: { registry?: string }) {
      return requireResourceX().push(locator, options);
    },

    "resource.pull"(locator: string, options?: { registry?: string }) {
      return requireResourceX().pull(locator, options);
    },

    "resource.clearCache"(registry?: string) {
      return requireResourceX().clearCache(registry);
    },

    // ---- Issue (proxy to IssueX) ----

    async "issue.publish"(title: string, body: string, author: string, assignee?: string) {
      const ix = requireIssueX();
      return ix.createIssue({ title, body, author, assignee });
    },

    async "issue.get"(number: number) {
      return requireIssueX().getIssueByNumber(number);
    },

    async "issue.list"(status?: string, author?: string, assignee?: string, label?: string) {
      const filter: Record<string, string> = {};
      if (status) filter.status = status;
      if (author) filter.author = author;
      if (assignee) filter.assignee = assignee;
      if (label) filter.label = label;
      return requireIssueX().listIssues(
        Object.keys(filter).length > 0 ? (filter as any) : undefined
      );
    },

    async "issue.update"(number: number, title?: string, body?: string, assignee?: string) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.title = title;
      if (body !== undefined) patch.body = body;
      if (assignee !== undefined) patch.assignee = assignee;
      return ix.updateIssue(issue.id, patch);
    },

    async "issue.close"(number: number) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.closeIssue(issue.id);
    },

    async "issue.reopen"(number: number) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.reopenIssue(issue.id);
    },

    async "issue.assign"(number: number, assignee: string) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.updateIssue(issue.id, { assignee });
    },

    async "issue.comment"(number: number, body: string, author: string) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.createComment(issue.id, body, author);
    },

    async "issue.comments"(number: number) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.listComments(issue.id);
    },

    async "issue.label"(number: number, label: string) {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      // Find or create label by name
      let labelObj = await ix.getLabelByName(label);
      if (!labelObj) labelObj = await ix.createLabel({ name: label });
      await ix.addLabel(issue.id, labelObj.id);
      return ix.getIssueByNumber(number);
    },

    async "issue.unlabel"(number: number, label: string) {
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
