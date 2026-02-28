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

import * as C from "@rolexjs/core";
import { parse } from "@rolexjs/parser";
import type { Runtime, State, Structure } from "@rolexjs/system";
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
  resolve(id: string): Structure;
  find(id: string): Structure | null;
  resourcex?: ResourceX;
  prototype?: {
    settle(id: string, source: string): void;
    evict(id: string): void;
    list(): Record<string, string>;
  };
  direct?(locator: string, args?: Record<string, unknown>): Promise<unknown>;
}

// biome-ignore lint/suspicious/noExplicitAny: ops are dynamically dispatched
export type Ops = Record<string, (...args: any[]) => any>;

// ================================================================
//  Factory
// ================================================================

export function createOps(ctx: OpsContext): Ops {
  const { rt, society, past, resolve, resourcex } = ctx;

  // ---- Helpers ----

  function ok(node: Structure, process: string): OpResult {
    return { state: rt.project(node), process };
  }

  function archive(node: Structure, process: string): OpResult {
    const archived = rt.transform(node, C.past);
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

  function removeExisting(parent: Structure, id: string): void {
    const state = rt.project(parent);
    const existing = findInState(state, id);
    if (existing) rt.remove(existing);
  }

  function requireResourceX(): ResourceX {
    if (!resourcex) throw new Error("ResourceX is not available.");
    return resourcex;
  }

  // ================================================================
  //  Operations
  // ================================================================

  return {
    // ---- Individual: lifecycle ----

    "individual.born"(content?: string, id?: string, alias?: readonly string[]): OpResult {
      validateGherkin(content);
      const node = rt.create(society, C.individual, content, id, alias);
      rt.create(node, C.identity, undefined, id);
      return ok(node, "born");
    },

    "individual.retire"(individual: string): OpResult {
      return archive(resolve(individual), "retire");
    },

    "individual.die"(individual: string): OpResult {
      return archive(resolve(individual), "die");
    },

    "individual.rehire"(pastNode: string): OpResult {
      const node = resolve(pastNode);
      const ind = rt.transform(node, C.individual);
      return ok(ind, "rehire");
    },

    // ---- Individual: external injection ----

    "individual.teach"(individual: string, principle: string, id?: string): OpResult {
      validateGherkin(principle);
      const parent = resolve(individual);
      if (id) removeExisting(parent, id);
      const node = rt.create(parent, C.principle, principle, id);
      return ok(node, "teach");
    },

    "individual.train"(individual: string, procedure: string, id?: string): OpResult {
      validateGherkin(procedure);
      const parent = resolve(individual);
      if (id) removeExisting(parent, id);
      const node = rt.create(parent, C.procedure, procedure, id);
      return ok(node, "train");
    },

    // ---- Role: focus ----

    "role.focus"(goal: string): OpResult {
      return ok(resolve(goal), "focus");
    },

    // ---- Role: execution ----

    "role.want"(
      individual: string,
      goal?: string,
      id?: string,
      alias?: readonly string[]
    ): OpResult {
      validateGherkin(goal);
      const node = rt.create(resolve(individual), C.goal, goal, id, alias);
      return ok(node, "want");
    },

    "role.plan"(
      goal: string,
      plan?: string,
      id?: string,
      after?: string,
      fallback?: string
    ): OpResult {
      validateGherkin(plan);
      const node = rt.create(resolve(goal), C.plan, plan, id);
      if (after) rt.link(node, resolve(after), "after", "before");
      if (fallback) rt.link(node, resolve(fallback), "fallback-for", "fallback");
      return ok(node, "plan");
    },

    "role.todo"(plan: string, task?: string, id?: string, alias?: readonly string[]): OpResult {
      validateGherkin(task);
      const node = rt.create(resolve(plan), C.task, task, id, alias);
      return ok(node, "todo");
    },

    "role.finish"(task: string, individual: string, encounter?: string): OpResult {
      validateGherkin(encounter);
      const taskNode = resolve(task);
      rt.tag(taskNode, "done");
      if (encounter) {
        const encId = taskNode.id ? `${taskNode.id}-finished` : undefined;
        const enc = rt.create(resolve(individual), C.encounter, encounter, encId);
        return ok(enc, "finish");
      }
      return ok(taskNode, "finish");
    },

    "role.complete"(plan: string, individual: string, encounter?: string): OpResult {
      validateGherkin(encounter);
      const planNode = resolve(plan);
      rt.tag(planNode, "done");
      const encId = planNode.id ? `${planNode.id}-completed` : undefined;
      const enc = rt.create(resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "complete");
    },

    "role.abandon"(plan: string, individual: string, encounter?: string): OpResult {
      validateGherkin(encounter);
      const planNode = resolve(plan);
      rt.tag(planNode, "abandoned");
      const encId = planNode.id ? `${planNode.id}-abandoned` : undefined;
      const enc = rt.create(resolve(individual), C.encounter, encounter, encId);
      return ok(enc, "abandon");
    },

    // ---- Role: cognition ----

    "role.reflect"(
      encounter: string,
      individual: string,
      experience?: string,
      id?: string
    ): OpResult {
      validateGherkin(experience);
      const encNode = resolve(encounter);
      const exp = rt.create(
        resolve(individual),
        C.experience,
        experience || encNode.information,
        id
      );
      rt.remove(encNode);
      return ok(exp, "reflect");
    },

    "role.realize"(
      experience: string,
      individual: string,
      principle?: string,
      id?: string
    ): OpResult {
      validateGherkin(principle);
      const expNode = resolve(experience);
      const prin = rt.create(
        resolve(individual),
        C.principle,
        principle || expNode.information,
        id
      );
      rt.remove(expNode);
      return ok(prin, "realize");
    },

    "role.master"(
      individual: string,
      procedure: string,
      id?: string,
      experience?: string
    ): OpResult {
      validateGherkin(procedure);
      const parent = resolve(individual);
      if (id) removeExisting(parent, id);
      const proc = rt.create(parent, C.procedure, procedure, id);
      if (experience) rt.remove(resolve(experience));
      return ok(proc, "master");
    },

    // ---- Role: knowledge management ----

    "role.forget"(nodeId: string): OpResult {
      const node = resolve(nodeId);
      rt.remove(node);
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

    // ---- Org ----

    "org.found"(content?: string, id?: string, alias?: readonly string[]): OpResult {
      validateGherkin(content);
      const node = rt.create(society, C.organization, content, id, alias);
      return ok(node, "found");
    },

    "org.charter"(org: string, charter: string, id?: string): OpResult {
      validateGherkin(charter);
      const node = rt.create(resolve(org), C.charter, charter, id);
      return ok(node, "charter");
    },

    "org.dissolve"(org: string): OpResult {
      return archive(resolve(org), "dissolve");
    },

    "org.hire"(org: string, individual: string): OpResult {
      const orgNode = resolve(org);
      rt.link(orgNode, resolve(individual), "membership", "belong");
      return ok(orgNode, "hire");
    },

    "org.fire"(org: string, individual: string): OpResult {
      const orgNode = resolve(org);
      rt.unlink(orgNode, resolve(individual), "membership", "belong");
      return ok(orgNode, "fire");
    },

    // ---- Position ----

    "position.establish"(content?: string, id?: string, alias?: readonly string[]): OpResult {
      validateGherkin(content);
      const node = rt.create(society, C.position, content, id, alias);
      return ok(node, "establish");
    },

    "position.charge"(position: string, duty: string, id?: string): OpResult {
      validateGherkin(duty);
      const node = rt.create(resolve(position), C.duty, duty, id);
      return ok(node, "charge");
    },

    "position.require"(position: string, procedure: string, id?: string): OpResult {
      validateGherkin(procedure);
      const parent = resolve(position);
      if (id) removeExisting(parent, id);
      const node = rt.create(parent, C.requirement, procedure, id);
      return ok(node, "require");
    },

    "position.abolish"(position: string): OpResult {
      return archive(resolve(position), "abolish");
    },

    "position.appoint"(position: string, individual: string): OpResult {
      const posNode = resolve(position);
      const indNode = resolve(individual);
      rt.link(posNode, indNode, "appointment", "serve");
      return ok(posNode, "appoint");
    },

    "position.dismiss"(position: string, individual: string): OpResult {
      const posNode = resolve(position);
      rt.unlink(posNode, resolve(individual), "appointment", "serve");
      return ok(posNode, "dismiss");
    },

    // ---- Census ----

    "census.list"(type?: string): string {
      const target = type === "past" ? past : society;
      const state = rt.project(target);
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

        // Members of this org
        const members = org.links?.filter((l) => l.relation === "membership") ?? [];
        if (members.length === 0) {
          lines.push("  (no members)");
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

    // ---- Prototype ----

    async "prototype.settle"(source: string): Promise<string> {
      const rx = requireResourceX();
      if (!ctx.prototype) throw new Error("Prototype registry is not available.");
      if (!ctx.direct) throw new Error("Direct dispatch is not available.");

      // Ingest the prototype resource — type resolver resolves @filename references
      const result = await rx.ingest<{
        id: string;
        instructions: Array<{ op: string; args: Record<string, unknown> }>;
      }>(source);

      // Execute each instruction
      for (const instr of result.instructions) {
        await ctx.direct(instr.op, instr.args);
      }

      // Register in prototype registry
      ctx.prototype.settle(result.id, source);

      return `Prototype "${result.id}" settled (${result.instructions.length} instructions).`;
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
