/**
 * Rolex — thin API shell.
 *
 * Public API:
 *   genesis()    — create the world on first run
 *   activate(id) — returns a stateful Role handle
 *   direct(loc, args) — direct the world to execute an instruction
 *
 * All operation implementations live in @rolexjs/prototype (createOps).
 * Rolex just wires Platform → ops and manages Role lifecycle.
 */

import type { ContextData, Platform } from "@rolexjs/core";
import * as C from "@rolexjs/core";
import { createOps, directives, type Ops, toArgs } from "@rolexjs/prototype";
import type { Initializer, Runtime, Structure } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";
import { RoleContext } from "./context.js";
import { findInState } from "./find.js";
import { Role, type RolexInternal } from "./role.js";

/** Summary entry returned by census.list. */
export interface CensusEntry {
  id?: string;
  name: string;
  tag?: string;
}

export class Rolex {
  private rt: Runtime;
  private ops: Ops;
  private resourcex?: ResourceX;
  private protoRegistry?: NonNullable<Platform["prototype"]>;
  private readonly initializer?: Initializer;
  private readonly persistContext?: {
    save: (roleId: string, data: ContextData) => void;
    load: (roleId: string) => ContextData | null;
  };

  private readonly bootstrap: readonly string[];
  private readonly society: Structure;
  private readonly past: Structure;

  constructor(platform: Platform) {
    this.rt = platform.runtime;
    this.resourcex = platform.resourcex;
    this.protoRegistry = platform.prototype;
    this.initializer = platform.initializer;
    this.bootstrap = platform.bootstrap ?? [];

    if (platform.saveContext && platform.loadContext) {
      this.persistContext = { save: platform.saveContext, load: platform.loadContext };
    }

    // Ensure world roots exist
    const roots = this.rt.roots();
    this.society = roots.find((r) => r.name === "society") ?? this.rt.create(null, C.society);

    const societyState = this.rt.project(this.society);
    const existingPast = societyState.children?.find((c) => c.name === "past");
    this.past = existingPast ?? this.rt.create(this.society, C.past);

    // Create ops from prototype — all operation implementations
    this.ops = createOps({
      rt: this.rt,
      society: this.society,
      past: this.past,
      resolve: (id: string) => {
        const node = this.find(id);
        if (!node) throw new Error(`"${id}" not found.`);
        return node;
      },
      find: (id: string) => this.find(id),
      resourcex: platform.resourcex,
      prototype: platform.prototype,
      direct: (locator: string, args?: Record<string, unknown>) => this.direct(locator, args),
    });
  }

  /** Genesis — create the world on first run. Settles built-in prototypes. */
  async genesis(): Promise<void> {
    await this.initializer?.bootstrap();
    // Settle bootstrap prototypes
    for (const source of this.bootstrap) {
      await this.direct("!prototype.settle", { source });
    }
  }

  /**
   * Activate a role — returns a stateful Role handle.
   *
   * If the individual does not exist in runtime but a prototype is registered,
   * auto-born the individual first.
   */
  async activate(individual: string): Promise<Role> {
    let node = this.find(individual);
    if (!node) {
      const hasProto = this.protoRegistry
        ? Object.hasOwn(this.protoRegistry.list(), individual)
        : false;
      if (hasProto) {
        this.ops["individual.born"](undefined, individual);
        node = this.find(individual)!;
      } else {
        throw new Error(`"${individual}" not found.`);
      }
    }
    const state = this.rt.project(node);
    const ctx = new RoleContext(individual);
    ctx.rehydrate(state);

    // Restore persisted focus (only override rehydrate default when persisted value is valid)
    const persisted = this.persistContext?.load(individual) ?? null;
    if (persisted) {
      if (persisted.focusedGoalId && this.find(persisted.focusedGoalId)) {
        ctx.focusedGoalId = persisted.focusedGoalId;
      }
      if (persisted.focusedPlanId && this.find(persisted.focusedPlanId)) {
        ctx.focusedPlanId = persisted.focusedPlanId;
      }
    }

    // Build internal API for Role — ops + ctx persistence
    const ops = this.ops;
    const saveCtx = (c: RoleContext) => {
      this.persistContext?.save(c.roleId, {
        focusedGoalId: c.focusedGoalId,
        focusedPlanId: c.focusedPlanId,
      });
    };

    const api: RolexInternal = {
      ops,
      saveCtx,
      direct: this.direct.bind(this),
    };

    return new Role(individual, ctx, api);
  }

  /** Find a node by id or alias across the entire society tree. Internal use only. */
  private find(id: string): Structure | null {
    const state = this.rt.project(this.society);
    return findInState(state, id);
  }

  /**
   * Direct the world to execute an instruction.
   *
   * - `!namespace.method` — dispatch to ops
   * - anything else — delegate to ResourceX `ingest`
   */
  async direct<T = unknown>(locator: string, args?: Record<string, unknown>): Promise<T> {
    if (locator.startsWith("!")) {
      const command = locator.slice(1);
      const fn = this.ops[command];
      if (!fn) {
        const hint = directives["identity-ethics"]?.["on-unknown-command"] ?? "";
        throw new Error(
          `Unknown command "${locator}".\n\n` +
            "You may be guessing the command name. " +
            "Load the relevant skill first with skill(locator) to learn the correct syntax.\n\n" +
            hint
        );
      }
      return fn(...toArgs(command, args ?? {})) as T;
    }
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    return this.resourcex.ingest<T>(locator, args);
  }
}

/** Create a Rolex instance from a Platform. */
export function createRoleX(platform: Platform): Rolex {
  return new Rolex(platform);
}
