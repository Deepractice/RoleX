/**
 * Rolex — stateless API layer.
 *
 * Every method takes explicit node references and returns a RolexResult.
 * No internal state — name registry, active role, session are the
 * caller's responsibility (MCP / CLI).
 *
 * Runtime is injected — caller decides storage.
 *
 * All textual inputs must be valid Gherkin Feature syntax.
 *
 * Namespaces:
 *   individual — lifecycle (born, retire, die, rehire)
 *   role       — execution + cognition + use (activate → achieve, reflect → master, use)
 *   org        — organization management (found, hire, appoint, ...)
 *   resource   — ResourceX instance (optional)
 */

import type { Platform } from "@rolexjs/core";
import * as C from "@rolexjs/core";
import { parse } from "@rolexjs/parser";
import { type Prototype, type Runtime, type State, type Structure, mergeState } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";

export interface RolexResult {
  /** Projection of the primary affected node. */
  state: State;
  /** Which process was executed (for render). */
  process: string;
}

export class Rolex {
  private rt: Runtime;
  private resourcex?: ResourceX;
  private _registerPrototype?: (id: string, source: string) => void;

  /** Root of the world. */
  readonly society: Structure;
  /** Container for archived things. */
  readonly past: Structure;

  /** Individual lifecycle — create, archive, restore. */
  readonly individual: IndividualNamespace;
  /** Role inner cycle — execution + cognition. */
  readonly role: RoleNamespace;
  /** Organization management — structure + membership. */
  readonly org: OrgNamespace;
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

    // Namespaces
    this.individual = new IndividualNamespace(this.rt, this.society, this.past);
    this.role = new RoleNamespace(this.rt, platform.prototype, platform.resourcex);
    this.org = new OrgNamespace(this.rt, this.society, this.past);
    this.resource = platform.resourcex;
  }

  /** Register a ResourceX source as a prototype. Ingests to extract id, stores id → source mapping. */
  async prototype(source: string): Promise<RolexResult> {
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    if (!this._registerPrototype) throw new Error("Platform does not support prototype registration.");
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
//  Individual — lifecycle
// ================================================================

class IndividualNamespace {
  constructor(
    private rt: Runtime,
    private society: Structure,
    private past: Structure
  ) {}

  /** Born an individual into society. */
  born(individual?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(individual);
    const node = this.rt.create(this.society, C.individual, individual, id, alias);
    return ok(this.rt, node, "born");
  }

  /** Retire an individual (can rehire later). */
  retire(individual: Structure): RolexResult {
    return archive(this.rt, this.past, individual, "retire");
  }

  /** An individual dies (permanent). */
  die(individual: Structure): RolexResult {
    return archive(this.rt, this.past, individual, "die");
  }

  /** Rehire a retired individual from past. */
  rehire(pastNode: Structure): RolexResult {
    const individual = this.rt.create(this.society, C.individual, pastNode.information);
    this.rt.remove(pastNode);
    return ok(this.rt, individual, "rehire");
  }
}

// ================================================================
//  Role — execution + cognition
// ================================================================

class RoleNamespace {
  constructor(
    private rt: Runtime,
    private prototype?: Prototype,
    private resourcex?: ResourceX
  ) {}

  // ---- Activation ----

  /** Activate: merge prototype (if any) with instance state. */
  async activate(individual: Structure): Promise<RolexResult> {
    const instanceState = this.rt.project(individual);
    const protoState = instanceState.id
      ? await this.prototype?.resolve(instanceState.id)
      : undefined;
    const state = protoState
      ? mergeState(protoState, instanceState)
      : instanceState;
    return { state, process: "activate" };
  }

  /** Focus: project a goal's state (view / switch context). */
  focus(goal: Structure): RolexResult {
    return ok(this.rt, goal, "focus");
  }

  // ---- Execution ----

  /** Declare a goal under an individual. */
  want(individual: Structure, goal?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(goal);
    const node = this.rt.create(individual, C.goal, goal, id, alias);
    return ok(this.rt, node, "want");
  }

  /** Create a plan for a goal. */
  plan(goal: Structure, plan?: string): RolexResult {
    validateGherkin(plan);
    const node = this.rt.create(goal, C.plan, plan);
    return ok(this.rt, node, "plan");
  }

  /** Add a task to a plan. */
  todo(plan: Structure, task?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(task);
    const node = this.rt.create(plan, C.task, task, id, alias);
    return ok(this.rt, node, "todo");
  }

  /** Finish a task: consume task, create encounter under individual. */
  finish(task: Structure, individual: Structure, encounter?: string): RolexResult {
    validateGherkin(encounter);
    const enc = this.rt.create(individual, C.encounter, encounter);
    this.rt.remove(task);
    return ok(this.rt, enc, "finish");
  }

  /** Achieve a goal: consume goal, create encounter under individual. */
  achieve(goal: Structure, individual: Structure, encounter?: string): RolexResult {
    validateGherkin(encounter);
    const enc = this.rt.create(individual, C.encounter, encounter);
    this.rt.remove(goal);
    return ok(this.rt, enc, "achieve");
  }

  /** Abandon a goal: consume goal, create encounter under individual. */
  abandon(goal: Structure, individual: Structure, encounter?: string): RolexResult {
    validateGherkin(encounter);
    const enc = this.rt.create(individual, C.encounter, encounter);
    this.rt.remove(goal);
    return ok(this.rt, enc, "abandon");
  }

  // ---- Cognition ----

  /** Reflect: consume encounter, create experience under individual. */
  reflect(encounter: Structure, individual: Structure, experience?: string): RolexResult {
    validateGherkin(experience);
    const exp = this.rt.create(individual, C.experience, experience || encounter.information);
    this.rt.remove(encounter);
    return ok(this.rt, exp, "reflect");
  }

  /** Realize: consume experience, create principle under knowledge. */
  realize(experience: Structure, knowledge: Structure, principle?: string): RolexResult {
    validateGherkin(principle);
    const prin = this.rt.create(knowledge, C.principle, principle || experience.information);
    this.rt.remove(experience);
    return ok(this.rt, prin, "realize");
  }

  /** Master: consume experience, create procedure under knowledge. */
  master(experience: Structure, knowledge: Structure, procedure?: string): RolexResult {
    validateGherkin(procedure);
    const proc = this.rt.create(knowledge, C.procedure, procedure || experience.information);
    this.rt.remove(experience);
    return ok(this.rt, proc, "master");
  }

  // ---- Resource interaction ----

  /** Skill: load full skill content by locator — for context injection (progressive disclosure layer 2). */
  async skill(locator: string): Promise<string> {
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    const content = await this.resourcex.ingest<string>(locator);
    if (typeof content === "string") return content;
    return JSON.stringify(content, null, 2);
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
    private past: Structure
  ) {}

  // ---- Structure ----

  /** Found an organization. */
  found(organization?: string, id?: string, alias?: readonly string[]): RolexResult {
    validateGherkin(organization);
    const org = this.rt.create(this.society, C.organization, organization, id, alias);
    return ok(this.rt, org, "found");
  }

  /** Establish a position within an organization. */
  establish(
    org: Structure,
    position?: string,
    id?: string,
    alias?: readonly string[]
  ): RolexResult {
    validateGherkin(position);
    const pos = this.rt.create(org, C.position, position, id, alias);
    return ok(this.rt, pos, "establish");
  }

  /** Define the charter for an organization. */
  charter(org: Structure, charter: string): RolexResult {
    validateGherkin(charter);
    const node = this.rt.create(org, C.charter, charter);
    return ok(this.rt, node, "charter");
  }

  /** Add a duty to a position. */
  charge(position: Structure, duty: string): RolexResult {
    validateGherkin(duty);
    const node = this.rt.create(position, C.duty, duty);
    return ok(this.rt, node, "charge");
  }

  // ---- Archival ----

  /** Dissolve an organization. */
  dissolve(org: Structure): RolexResult {
    return archive(this.rt, this.past, org, "dissolve");
  }

  /** Abolish a position. */
  abolish(position: Structure): RolexResult {
    return archive(this.rt, this.past, position, "abolish");
  }

  // ---- Membership & Appointment ----

  /** Hire: link individual to organization via membership. */
  hire(org: Structure, individual: Structure): RolexResult {
    this.rt.link(org, individual, "membership", "belong");
    return ok(this.rt, org, "hire");
  }

  /** Fire: remove membership link. */
  fire(org: Structure, individual: Structure): RolexResult {
    this.rt.unlink(org, individual, "membership", "belong");
    return ok(this.rt, org, "fire");
  }

  /** Appoint: link individual to position via appointment. */
  appoint(position: Structure, individual: Structure): RolexResult {
    this.rt.link(position, individual, "appointment", "serve");
    return ok(this.rt, position, "appoint");
  }

  /** Dismiss: remove appointment link. */
  dismiss(position: Structure, individual: Structure): RolexResult {
    this.rt.unlink(position, individual, "appointment", "serve");
    return ok(this.rt, position, "dismiss");
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
  const archived = rt.create(past, C.past, node.information);
  rt.remove(node);
  return ok(rt, archived, process);
}

function ok(rt: Runtime, node: Structure, process: string): RolexResult {
  return {
    state: rt.project(node),
    process,
  };
}

/** Create a Rolex instance from a Platform. */
export function createRoleX(platform: Platform): Rolex {
  return new Rolex(platform);
}
