/**
 * Rolex — stateless API layer.
 *
 * Every method takes string ids for existing nodes and resolves internally.
 * No internal state — name registry, active role, session are the
 * caller's responsibility (MCP / CLI).
 *
 * Runtime is injected — caller decides storage.
 *
 * All textual inputs must be valid Gherkin Feature syntax.
 *
 * Namespaces:
 *   individual — lifecycle (born, retire, die, rehire) + external injection (teach, train)
 *   role       — execution + cognition + use (activate → complete, reflect → master, use)
 *   org        — organization management (found, charter, dissolve, hire, fire)
 *   position   — position management (establish, abolish, charge, appoint, dismiss)
 *   resource   — ResourceX instance (optional)
 */

import type { ContextData, Platform } from "@rolexjs/core";
import * as C from "@rolexjs/core";
import { parse } from "@rolexjs/parser";
import {
  mergeState,
  type Prototype,
  type Runtime,
  type State,
  type Structure,
} from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";
import { RoleContext } from "./context.js";

export interface RolexResult {
  /** Projection of the primary affected node. */
  state: State;
  /** Which process was executed (for render). */
  process: string;
  /** Cognitive hint — populated when RoleContext is used. */
  hint?: string;
  /** Role context — returned by activate, pass to subsequent operations. */
  ctx?: RoleContext;
}

/** Resolve an id to a Structure node, throws if not found. */
type Resolve = (id: string) => Structure;

export class Rolex {
  private rt: Runtime;
  private resourcex?: ResourceX;
  private _registerPrototype?: (id: string, source: string) => void;

  /** Root of the world. */
  readonly society: Structure;
  /** Container for archived things. */
  readonly past: Structure;

  /** Individual lifecycle — create, archive, restore, external injection. */
  readonly individual: IndividualNamespace;
  /** Role inner cycle — execution + cognition. */
  readonly role: RoleNamespace;
  /** Organization management — structure + membership. */
  readonly org: OrgNamespace;
  /** Position management — establish, charge, appoint. */
  readonly position: PositionNamespace;
  /** Resource management (optional — powered by ResourceX). */
  readonly resource?: ResourceX;

  constructor(platform: Platform) {
    this.rt = platform.runtime;
    this.resourcex = platform.resourcex;
    this._registerPrototype = platform.registerPrototype;

    // Ensure world roots exist (idempotent — reuse if already created by another process)
    const roots = this.rt.roots();
    this.society = roots.find((r) => r.name === "society") ?? this.rt.create(null, C.society);

    const societyState = this.rt.project(this.society);
    const existingPast = societyState.children?.find((c) => c.name === "past");
    this.past = existingPast ?? this.rt.create(this.society, C.past);

    // Shared resolver — all namespaces use this to look up nodes by id
    const resolve: Resolve = (id: string) => {
      const node = this.find(id);
      if (!node) throw new Error(`"${id}" not found.`);
      return node;
    };

    // Namespaces
    this.individual = new IndividualNamespace(this.rt, this.society, this.past, resolve);
    const persistContext =
      platform.saveContext && platform.loadContext
        ? { save: platform.saveContext, load: platform.loadContext }
        : undefined;
    this.role = new RoleNamespace(
      this.rt,
      resolve,
      platform.prototype,
      platform.resourcex,
      persistContext
    );
    this.org = new OrgNamespace(this.rt, this.society, this.past, resolve);
    this.position = new PositionNamespace(this.rt, this.society, this.past, resolve);
    this.resource = platform.resourcex;
  }

  /** Register a ResourceX source as a prototype. Ingests to extract id, stores id → source mapping. */
  async prototype(source: string): Promise<RolexResult> {
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    if (!this._registerPrototype)
      throw new Error("Platform does not support prototype registration.");
    const state = await this.resourcex.ingest<State>(source);
    if (!state.id) throw new Error("Prototype resource must have an id.");
    this._registerPrototype(state.id, source);
    return { state, process: "prototype" };
  }

  /** Find a node by id or alias across the entire society tree. */
  find(id: string): Structure | null {
    const target = id.toLowerCase();
    const state = this.rt.project(this.society);
    return findInState(state, target);
  }
}

// ================================================================
//  Individual — lifecycle + external injection
// ================================================================

class IndividualNamespace {
  constructor(
    private rt: Runtime,
    private society: Structure,
    private past: Structure,
    private resolve: Resolve
  ) {}

  /** Born an individual into society. */
  born(individual?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(individual);
    const node = this.rt.create(this.society, C.individual, individual, id, alias);
    // Scaffolding: every individual has identity
    this.rt.create(node, C.identity);
    return ok(this.rt, node, "born");
  }

  /** Retire an individual (can rehire later). */
  retire(individual: string): RolexResult {
    return archive(this.rt, this.past, this.resolve(individual), "retire");
  }

  /** An individual dies (permanent). */
  die(individual: string): RolexResult {
    return archive(this.rt, this.past, this.resolve(individual), "die");
  }

  /** Rehire a retired individual from past. */
  rehire(pastNode: string): RolexResult {
    const past = this.resolve(pastNode);
    const individual = this.rt.create(this.society, C.individual, past.information, past.id);
    // Scaffolding: restore identity
    this.rt.create(individual, C.identity);
    this.rt.remove(past);
    return ok(this.rt, individual, "rehire");
  }

  // ---- External injection ----

  /** Teach: directly inject a principle into an individual — no experience consumed. Upserts by id. */
  teach(individual: string, principle: string, id?: string): RolexResult {
    validateGherkin(principle);
    const parent = this.resolve(individual);
    if (id) this.removeExisting(parent, id);
    const prin = this.rt.create(parent, C.principle, principle, id);
    return ok(this.rt, prin, "teach");
  }

  /** Train: directly inject a procedure (skill) into an individual — no experience consumed. Upserts by id. */
  train(individual: string, procedure: string, id?: string): RolexResult {
    validateGherkin(procedure);
    const parent = this.resolve(individual);
    if (id) this.removeExisting(parent, id);
    const proc = this.rt.create(parent, C.procedure, procedure, id);
    return ok(this.rt, proc, "train");
  }

  /** Remove existing child node with matching id (for upsert). */
  private removeExisting(parent: Structure, id: string): void {
    const state = this.rt.project(parent);
    const existing = findInState(state, id);
    if (existing) this.rt.remove(existing);
  }
}

// ================================================================
//  Role — execution + cognition
// ================================================================

class RoleNamespace {
  constructor(
    private rt: Runtime,
    private resolve: Resolve,
    private prototype?: Prototype,
    private resourcex?: ResourceX,
    private persistContext?: {
      save: (roleId: string, data: ContextData) => void;
      load: (roleId: string) => ContextData | null;
    }
  ) {}

  private saveCtx(ctx?: RoleContext): void {
    if (!ctx || !this.persistContext) return;
    this.persistContext.save(ctx.roleId, {
      focusedGoalId: ctx.focusedGoalId,
      focusedPlanId: ctx.focusedPlanId,
    });
  }

  // ---- Activation ----

  /** Activate: merge prototype (if any) with instance state. Returns ctx when created. */
  async activate(individual: string): Promise<RolexResult> {
    const node = this.resolve(individual);
    const instanceState = this.rt.project(node);
    const protoState = instanceState.id
      ? await this.prototype?.resolve(instanceState.id)
      : undefined;
    const state = protoState ? mergeState(protoState, instanceState) : instanceState;
    const ctx = new RoleContext(individual);
    ctx.rehydrate(state);

    // Restore persisted focus (overrides rehydrate defaults)
    const persisted = this.persistContext?.load(individual);
    if (persisted) {
      ctx.focusedGoalId = persisted.focusedGoalId;
      ctx.focusedPlanId = persisted.focusedPlanId;
    }

    return { state, process: "activate", hint: ctx.cognitiveHint("activate") ?? undefined, ctx };
  }

  /** Focus: project a goal's state (view / switch context). */
  focus(goal: string, ctx?: RoleContext): RolexResult {
    if (ctx) {
      ctx.focusedGoalId = goal;
      ctx.focusedPlanId = null;
    }
    const result = ok(this.rt, this.resolve(goal), "focus");
    if (ctx) result.hint = ctx.cognitiveHint("focus") ?? undefined;
    this.saveCtx(ctx);
    return result;
  }

  // ---- Execution ----

  /** Declare a goal under an individual. */
  want(
    individual: string,
    goal?: string,
    id?: string,
    alias?: readonly string[],
    ctx?: RoleContext
  ): RolexResult {
    validateGherkin(goal);
    const node = this.rt.create(this.resolve(individual), C.goal, goal, id, alias);
    const result = ok(this.rt, node, "want");
    if (ctx) {
      if (id) ctx.focusedGoalId = id;
      ctx.focusedPlanId = null;
      result.hint = ctx.cognitiveHint("want") ?? undefined;
      this.saveCtx(ctx);
    }
    return result;
  }

  /** Create a plan for a goal. Optionally link to another plan via after (sequential) or fallback (alternative). */
  plan(
    goal: string,
    plan?: string,
    id?: string,
    ctx?: RoleContext,
    after?: string,
    fallback?: string
  ): RolexResult {
    validateGherkin(plan);
    const node = this.rt.create(this.resolve(goal), C.plan, plan, id);
    if (after) this.rt.link(node, this.resolve(after), "after", "before");
    if (fallback) this.rt.link(node, this.resolve(fallback), "fallback-for", "fallback");
    const result = ok(this.rt, node, "plan");
    if (ctx) {
      if (id) ctx.focusedPlanId = id;
      result.hint = ctx.cognitiveHint("plan") ?? undefined;
      this.saveCtx(ctx);
    }
    return result;
  }

  /** Add a task to a plan. */
  todo(
    plan: string,
    task?: string,
    id?: string,
    alias?: readonly string[],
    ctx?: RoleContext
  ): RolexResult {
    validateGherkin(task);
    const node = this.rt.create(this.resolve(plan), C.task, task, id, alias);
    const result = ok(this.rt, node, "todo");
    if (ctx) result.hint = ctx.cognitiveHint("todo") ?? undefined;
    return result;
  }

  /** Finish a task: consume task, optionally create encounter under individual. */
  finish(task: string, individual: string, encounter?: string, ctx?: RoleContext): RolexResult {
    validateGherkin(encounter);
    const taskNode = this.resolve(task);
    let enc: Structure | undefined;
    if (encounter) {
      const encId = taskNode.id ? `${taskNode.id}-finished` : undefined;
      enc = this.rt.create(this.resolve(individual), C.encounter, encounter, encId);
    }
    this.rt.remove(taskNode);
    const result: RolexResult = enc
      ? ok(this.rt, enc, "finish")
      : { state: this.rt.project(this.resolve(individual)), process: "finish" };
    if (ctx) {
      if (enc) {
        const encId = result.state.id ?? task;
        ctx.addEncounter(encId);
      }
      result.hint = ctx.cognitiveHint("finish") ?? undefined;
    }
    return result;
  }

  /** Complete a plan: consume plan, create encounter under individual. */
  complete(plan: string, individual: string, encounter?: string, ctx?: RoleContext): RolexResult {
    validateGherkin(encounter);
    const planNode = this.resolve(plan);
    const encId = planNode.id ? `${planNode.id}-completed` : undefined;
    const enc = this.rt.create(this.resolve(individual), C.encounter, encounter, encId);
    this.rt.remove(planNode);
    const result = ok(this.rt, enc, "complete");
    if (ctx) {
      ctx.addEncounter(result.state.id ?? plan);
      if (ctx.focusedPlanId === plan) ctx.focusedPlanId = null;
      result.hint = ctx.cognitiveHint("complete") ?? undefined;
      this.saveCtx(ctx);
    }
    return result;
  }

  /** Abandon a plan: consume plan, create encounter under individual. */
  abandon(plan: string, individual: string, encounter?: string, ctx?: RoleContext): RolexResult {
    validateGherkin(encounter);
    const planNode = this.resolve(plan);
    const encId = planNode.id ? `${planNode.id}-abandoned` : undefined;
    const enc = this.rt.create(this.resolve(individual), C.encounter, encounter, encId);
    this.rt.remove(planNode);
    const result = ok(this.rt, enc, "abandon");
    if (ctx) {
      ctx.addEncounter(result.state.id ?? plan);
      if (ctx.focusedPlanId === plan) ctx.focusedPlanId = null;
      result.hint = ctx.cognitiveHint("abandon") ?? undefined;
      this.saveCtx(ctx);
    }
    return result;
  }

  // ---- Cognition ----

  /** Reflect: consume encounter, create experience under individual. */
  reflect(
    encounter: string,
    individual: string,
    experience?: string,
    id?: string,
    ctx?: RoleContext
  ): RolexResult {
    validateGherkin(experience);
    if (ctx) ctx.requireEncounterIds([encounter]);
    const encNode = this.resolve(encounter);
    const exp = this.rt.create(
      this.resolve(individual),
      C.experience,
      experience || encNode.information,
      id
    );
    this.rt.remove(encNode);
    const result = ok(this.rt, exp, "reflect");
    if (ctx) {
      ctx.consumeEncounters([encounter]);
      if (id) ctx.addExperience(id);
      result.hint = ctx.cognitiveHint("reflect") ?? undefined;
    }
    return result;
  }

  /** Realize: consume experience, create principle under individual. */
  realize(
    experience: string,
    individual: string,
    principle?: string,
    id?: string,
    ctx?: RoleContext
  ): RolexResult {
    validateGherkin(principle);
    if (ctx) ctx.requireExperienceIds([experience]);
    const expNode = this.resolve(experience);
    const prin = this.rt.create(
      this.resolve(individual),
      C.principle,
      principle || expNode.information,
      id
    );
    this.rt.remove(expNode);
    const result = ok(this.rt, prin, "realize");
    if (ctx) {
      ctx.consumeExperiences([experience]);
      result.hint = ctx.cognitiveHint("realize") ?? undefined;
    }
    return result;
  }

  /** Master: create procedure under individual, optionally consuming experience. */
  master(
    individual: string,
    procedure: string,
    id?: string,
    experience?: string,
    ctx?: RoleContext
  ): RolexResult {
    validateGherkin(procedure);
    if (ctx && experience) ctx.requireExperienceIds([experience]);
    const parent = this.resolve(individual);
    if (id) {
      const existing = findInState(this.rt.project(parent), id);
      if (existing) this.rt.remove(existing);
    }
    const proc = this.rt.create(parent, C.procedure, procedure, id);
    if (experience) {
      this.rt.remove(this.resolve(experience));
      if (ctx) ctx.consumeExperiences([experience]);
    }
    const result = ok(this.rt, proc, "master");
    if (ctx) result.hint = ctx.cognitiveHint("master") ?? undefined;
    return result;
  }

  // ---- Knowledge management ----

  /** Forget: remove any node under an individual by id. Prototype nodes are read-only. */
  async forget(nodeId: string, individual: string): Promise<RolexResult> {
    try {
      const node = this.resolve(nodeId);
      this.rt.remove(node);
      return { state: { ...node, children: [] }, process: "forget" };
    } catch {
      // Not in runtime graph — check if it's a prototype node
      if (this.prototype) {
        // Resolve individual to get its actual stored id (case-sensitive match for prototype)
        const indNode = this.resolve(individual);
        const instanceState = this.rt.project(indNode);
        const protoState = instanceState.id
          ? await this.prototype.resolve(instanceState.id)
          : undefined;
        if (protoState && findInState(protoState, nodeId.toLowerCase())) {
          throw new Error(`"${nodeId}" is a prototype node (read-only) and cannot be forgotten.`);
        }
      }
      throw new Error(`"${nodeId}" not found.`);
    }
  }

  // ---- Resource interaction ----

  /** Skill: load full skill content by locator — for context injection (progressive disclosure layer 2). */
  async skill(locator: string): Promise<string> {
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    const content = await this.resourcex.ingest<string>(locator);
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);

    // Try to render RXM context alongside content
    try {
      const rxm = await this.resourcex.info(locator);
      return `${formatRXM(rxm)}\n\n${text}`;
    } catch {
      // Path-based locator or info unavailable — return content only
      return text;
    }
  }

  /** Use a resource — role's entry point for interacting with external resources. */
  use<T = unknown>(locator: string): Promise<T> {
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    return this.resourcex.ingest<T>(locator);
  }
}

// ================================================================
//  Org — organization management
// ================================================================

class OrgNamespace {
  constructor(
    private rt: Runtime,
    private society: Structure,
    private past: Structure,
    private resolve: Resolve
  ) {}

  // ---- Structure ----

  /** Found an organization. */
  found(organization?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(organization);
    const org = this.rt.create(this.society, C.organization, organization, id, alias);
    return ok(this.rt, org, "found");
  }

  /** Define the charter for an organization. */
  charter(org: string, charter: string): RolexResult {
    validateGherkin(charter);
    const node = this.rt.create(this.resolve(org), C.charter, charter);
    return ok(this.rt, node, "charter");
  }

  // ---- Archival ----

  /** Dissolve an organization. */
  dissolve(org: string): RolexResult {
    return archive(this.rt, this.past, this.resolve(org), "dissolve");
  }

  // ---- Membership ----

  /** Hire: link individual to organization via membership. */
  hire(org: string, individual: string): RolexResult {
    const orgNode = this.resolve(org);
    this.rt.link(orgNode, this.resolve(individual), "membership", "belong");
    return ok(this.rt, orgNode, "hire");
  }

  /** Fire: remove membership link. */
  fire(org: string, individual: string): RolexResult {
    const orgNode = this.resolve(org);
    this.rt.unlink(orgNode, this.resolve(individual), "membership", "belong");
    return ok(this.rt, orgNode, "fire");
  }
}

// ================================================================
//  Position — position management
// ================================================================

class PositionNamespace {
  constructor(
    private rt: Runtime,
    private society: Structure,
    private past: Structure,
    private resolve: Resolve
  ) {}

  // ---- Structure ----

  /** Establish a position. */
  establish(position?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(position);
    const pos = this.rt.create(this.society, C.position, position, id, alias);
    return ok(this.rt, pos, "establish");
  }

  /** Add a duty to a position. */
  charge(position: string, duty: string, id?: string): RolexResult {
    validateGherkin(duty);
    const node = this.rt.create(this.resolve(position), C.duty, duty, id);
    return ok(this.rt, node, "charge");
  }

  // ---- Archival ----

  /** Abolish a position. */
  abolish(position: string): RolexResult {
    return archive(this.rt, this.past, this.resolve(position), "abolish");
  }

  // ---- Appointment ----

  /** Appoint: link individual to position via appointment. */
  appoint(position: string, individual: string): RolexResult {
    const posNode = this.resolve(position);
    this.rt.link(posNode, this.resolve(individual), "appointment", "serve");
    return ok(this.rt, posNode, "appoint");
  }

  /** Dismiss: remove appointment link. */
  dismiss(position: string, individual: string): RolexResult {
    const posNode = this.resolve(position);
    this.rt.unlink(posNode, this.resolve(individual), "appointment", "serve");
    return ok(this.rt, posNode, "dismiss");
  }
}

// ================================================================
//  Shared helpers
// ================================================================

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

function archive(rt: Runtime, past: Structure, node: Structure, process: string): RolexResult {
  const archived = rt.create(past, C.past, node.information, node.id);
  rt.remove(node);
  return ok(rt, archived, process);
}

function ok(rt: Runtime, node: Structure, process: string): RolexResult {
  return {
    state: rt.project(node),
    process,
  };
}

/** Render file tree from RXM source.files */
function renderFileTree(files: Record<string, any>, indent = ""): string {
  const lines: string[] = [];
  for (const [name, value] of Object.entries(files)) {
    if (value && typeof value === "object" && !("size" in value)) {
      // Directory
      lines.push(`${indent}${name}`);
      lines.push(renderFileTree(value, `${indent}  `));
    } else {
      const size = value?.size ? ` (${value.size} bytes)` : "";
      lines.push(`${indent}${name}${size}`);
    }
  }
  return lines.filter(Boolean).join("\n");
}

/** Format RXM info as context header for skill injection. */
function formatRXM(rxm: any): string {
  const lines: string[] = [`--- RXM: ${rxm.locator} ---`];
  const def = rxm.definition;
  if (def) {
    if (def.author) lines.push(`Author: ${def.author}`);
    if (def.description) lines.push(`Description: ${def.description}`);
  }
  const source = rxm.source;
  if (source?.files) {
    lines.push(`Files:`);
    lines.push(renderFileTree(source.files, "  "));
  }
  lines.push("---");
  return lines.join("\n");
}

/** Create a Rolex instance from a Platform. */
export function createRoleX(platform: Platform): Rolex {
  return new Rolex(platform);
}
