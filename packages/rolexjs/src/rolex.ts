/**
 * Rolex — stateless API layer.
 *
 * Every method takes explicit node references and returns a RolexResult.
 * No internal state — name registry, active role, session are the
 * caller's responsibility (MCP / CLI).
 *
 * Runtime is injected — caller decides storage.
 */
import type { Runtime, Structure, State } from "@rolexjs/system";
import type { Platform } from "@rolexjs/core";
import * as C from "@rolexjs/core";

export interface RolexResult {
  /** Projection of the primary affected node. */
  state: State;
  /** Which process was executed (for render). */
  process: string;
}

export class Rolex {
  private rt: Runtime;

  /** Root of the world. */
  readonly society: Structure;
  /** Container for archived things. */
  readonly past: Structure;

  constructor(platform: Platform) {
    this.rt = platform.runtime;

    // Ensure world roots exist (idempotent — reuse if already created by another process)
    const roots = this.rt.roots();
    this.society = roots.find(r => r.name === "society") ?? this.rt.create(null, C.society);

    const societyState = this.rt.project(this.society);
    const existingPast = societyState.children?.find(c => c.name === "past");
    this.past = existingPast ?? this.rt.create(this.society, C.past);
  }

  // ================================================================
  //  Lifecycle — creation
  // ================================================================

  /** Born an individual into society. Scaffolds identity + knowledge. */
  born(source?: string, id?: string, alias?: readonly string[]): RolexResult {
    const node = this.rt.create(this.society, C.individual, source, id, alias);
    this.rt.create(node, C.identity);
    this.rt.create(node, C.knowledge);
    return this.ok(node, "born");
  }

  /** Found an organization. */
  found(source?: string, id?: string, alias?: readonly string[]): RolexResult {
    const org = this.rt.create(this.society, C.organization, source, id, alias);
    return this.ok(org, "found");
  }

  /** Establish a position within an organization. */
  establish(org: Structure, source?: string, id?: string, alias?: readonly string[]): RolexResult {
    const pos = this.rt.create(org, C.position, source, id, alias);
    return this.ok(pos, "establish");
  }

  /** Define the charter for an organization. */
  charter(org: Structure, source: string): RolexResult {
    const node = this.rt.create(org, C.charter, source);
    return this.ok(node, "charter");
  }

  /** Add a duty to a position. */
  charge(position: Structure, source: string): RolexResult {
    const node = this.rt.create(position, C.duty, source);
    return this.ok(node, "charge");
  }

  // ================================================================
  //  Lifecycle — archival
  // ================================================================

  /** Retire an individual (can rehire later). */
  retire(individual: Structure): RolexResult {
    return this.archive(individual, "retire");
  }

  /** An individual dies (permanent). */
  die(individual: Structure): RolexResult {
    return this.archive(individual, "die");
  }

  /** Dissolve an organization. */
  dissolve(org: Structure): RolexResult {
    return this.archive(org, "dissolve");
  }

  /** Abolish a position. */
  abolish(position: Structure): RolexResult {
    return this.archive(position, "abolish");
  }

  /** Rehire a retired individual from past. */
  rehire(pastNode: Structure): RolexResult {
    const individual = this.rt.create(this.society, C.individual, pastNode.information);
    this.rt.remove(pastNode);
    this.rt.create(individual, C.identity);
    this.rt.create(individual, C.knowledge);
    return this.ok(individual, "rehire");
  }

  // ================================================================
  //  Organization — membership & appointment
  // ================================================================

  /** Hire: link individual to organization via membership. */
  hire(org: Structure, individual: Structure): RolexResult {
    this.rt.link(org, individual, "membership", "belong");
    return this.ok(org, "hire");
  }

  /** Fire: remove membership link. */
  fire(org: Structure, individual: Structure): RolexResult {
    this.rt.unlink(org, individual, "membership", "belong");
    return this.ok(org, "fire");
  }

  /** Appoint: link individual to position via appointment. */
  appoint(position: Structure, individual: Structure): RolexResult {
    this.rt.link(position, individual, "appointment", "serve");
    return this.ok(position, "appoint");
  }

  /** Dismiss: remove appointment link. */
  dismiss(position: Structure, individual: Structure): RolexResult {
    this.rt.unlink(position, individual, "appointment", "serve");
    return this.ok(position, "dismiss");
  }

  // ================================================================
  //  Role — activation (pure projection, no mutation)
  // ================================================================

  /** Activate: project an individual's full state. */
  activate(individual: Structure): RolexResult {
    return this.ok(individual, "activate");
  }

  /** Focus: project a goal's state (view / switch context). */
  focus(goal: Structure): RolexResult {
    return this.ok(goal, "focus");
  }

  // ================================================================
  //  Execution — goal pursuit
  // ================================================================

  /** Declare a goal under an individual. */
  want(individual: Structure, source?: string, id?: string, alias?: readonly string[]): RolexResult {
    const goal = this.rt.create(individual, C.goal, source, id, alias);
    return this.ok(goal, "want");
  }

  /** Create a plan for a goal. */
  plan(goal: Structure, source?: string): RolexResult {
    const node = this.rt.create(goal, C.plan, source);
    return this.ok(node, "plan");
  }

  /** Add a task to a plan. */
  todo(plan: Structure, source?: string, id?: string, alias?: readonly string[]): RolexResult {
    const task = this.rt.create(plan, C.task, source, id, alias);
    return this.ok(task, "todo");
  }

  /** Finish a task: consume task, create encounter under individual. */
  finish(task: Structure, individual: Structure, experience?: string): RolexResult {
    const enc = this.rt.create(individual, C.encounter, experience);
    this.rt.remove(task);
    return this.ok(enc, "finish");
  }

  /** Achieve a goal: consume goal, create encounter under individual. */
  achieve(goal: Structure, individual: Structure, experience?: string): RolexResult {
    const enc = this.rt.create(individual, C.encounter, experience);
    this.rt.remove(goal);
    return this.ok(enc, "achieve");
  }

  /** Abandon a goal: consume goal, create encounter under individual. */
  abandon(goal: Structure, individual: Structure, experience?: string): RolexResult {
    const enc = this.rt.create(individual, C.encounter, experience);
    this.rt.remove(goal);
    return this.ok(enc, "abandon");
  }

  // ================================================================
  //  Cognition — learning
  // ================================================================

  /** Reflect: consume encounter, create experience under individual. */
  reflect(encounter: Structure, individual: Structure, source?: string): RolexResult {
    const exp = this.rt.create(individual, C.experience, source || encounter.information);
    this.rt.remove(encounter);
    return this.ok(exp, "reflect");
  }

  /** Realize: consume experience, create principle under knowledge. */
  realize(experience: Structure, knowledge: Structure, source?: string): RolexResult {
    const prin = this.rt.create(knowledge, C.principle, source || experience.information);
    this.rt.remove(experience);
    return this.ok(prin, "realize");
  }

  /** Master: consume experience, create skill under knowledge. */
  master(experience: Structure, knowledge: Structure, source?: string): RolexResult {
    const sk = this.rt.create(knowledge, C.skill, source || experience.information);
    this.rt.remove(experience);
    return this.ok(sk, "master");
  }

  // ================================================================
  //  Query
  // ================================================================

  /** Project any node's full state (subtree + links). */
  project(node: Structure): State {
    return this.rt.project(node);
  }

  /** Find a node by id or alias across the entire society tree. */
  find(id: string): Structure | null {
    const target = id.toLowerCase();
    const state = this.rt.project(this.society);
    return this.findInState(state, target);
  }

  // ================================================================
  //  Internals
  // ================================================================

  private findInState(state: State, target: string): Structure | null {
    // Match by id
    if (state.id && state.id.toLowerCase() === target) {
      return state;
    }
    // Match by alias
    if (state.alias) {
      for (const a of state.alias) {
        if (a.toLowerCase() === target) {
          return state;
        }
      }
    }
    // Recurse into children
    for (const child of state.children ?? []) {
      const found = this.findInState(child, target);
      if (found) return found;
    }
    return null;
  }

  private archive(node: Structure, process: string): RolexResult {
    const archived = this.rt.create(this.past, C.past, node.information);
    this.rt.remove(node);
    return this.ok(archived, process);
  }

  private ok(node: Structure, process: string): RolexResult {
    return {
      state: this.rt.project(node),
      process,
    };
  }
}

/** Create a Rolex instance from a Platform. */
export function createRoleX(platform: Platform): Rolex {
  return new Rolex(platform);
}
