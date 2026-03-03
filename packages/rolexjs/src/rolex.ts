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

import type { Platform, RoleXRepository } from "@rolexjs/core";
import * as C from "@rolexjs/core";
import { createOps, directives, type Ops, toArgs } from "@rolexjs/prototype";
import type { Initializer, Runtime, Structure } from "@rolexjs/system";
import type { ResourceX } from "resourcexjs";
import { createResourceX, setProvider } from "resourcexjs";
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
  private ops!: Ops;
  private resourcex?: ResourceX;
  private repo: RoleXRepository;
  private readonly initializer?: Initializer;

  private readonly bootstrap: readonly string[];
  private society!: Structure;
  private past!: Structure;

  private constructor(platform: Platform) {
    this.repo = platform.repository;
    this.rt = this.repo.runtime;
    this.initializer = platform.initializer;
    this.bootstrap = platform.bootstrap ?? [];

    // Create ResourceX from injected provider
    if (platform.resourcexProvider) {
      setProvider(platform.resourcexProvider);
      this.resourcex = createResourceX(
        platform.resourcexExecutor
          ? { isolator: "custom", executor: platform.resourcexExecutor }
          : undefined
      );
    }
  }

  /** Create a Rolex instance from a Platform (async due to Runtime initialization). */
  static async create(platform: Platform): Promise<Rolex> {
    const rolex = new Rolex(platform);
    await rolex.init();
    return rolex;
  }

  /** Async initialization — called by Rolex.create(). */
  private async init(): Promise<void> {
    // Ensure world roots exist
    const roots = await this.rt.roots();
    this.society =
      roots.find((r) => r.name === "society") ?? (await this.rt.create(null, C.society));

    const societyState = await this.rt.project(this.society);
    const existingPast = societyState.children?.find((c) => c.name === "past");
    this.past = existingPast ?? (await this.rt.create(this.society, C.past));

    // Create ops from prototype — all operation implementations
    this.ops = createOps({
      rt: this.rt,
      society: this.society,
      past: this.past,
      resolve: async (id: string) => {
        const node = await this.find(id);
        if (!node) throw new Error(`"${id}" not found.`);
        return node;
      },
      find: (id: string) => this.find(id),
      resourcex: this.resourcex,
      prototype: this.repo.prototype,
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
    let node = await this.find(individual);
    if (!node) {
      const hasProto = Object.hasOwn(this.repo.prototype.list(), individual);
      if (hasProto) {
        await this.ops["individual.born"](undefined, individual);
        node = (await this.find(individual))!;
      } else {
        throw new Error(`"${individual}" not found.`);
      }
    }
    const state = await this.rt.project(node);
    const ctx = new RoleContext(individual);
    ctx.rehydrate(state);

    // Restore persisted focus (only override rehydrate default when persisted value is valid)
    const persisted = await this.repo.loadContext(individual);
    if (persisted) {
      if (persisted.focusedGoalId && (await this.find(persisted.focusedGoalId))) {
        ctx.focusedGoalId = persisted.focusedGoalId;
      }
      if (persisted.focusedPlanId && (await this.find(persisted.focusedPlanId))) {
        ctx.focusedPlanId = persisted.focusedPlanId;
      }
    }

    // Build internal API for Role — ops + ctx persistence
    const ops = this.ops;
    const repo = this.repo;
    const saveCtx = async (c: RoleContext) => {
      await repo.saveContext(c.roleId, {
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
  private async find(id: string): Promise<Structure | null> {
    const state = await this.rt.project(this.society);
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
      return (await fn(...toArgs(command, args ?? {}))) as T;
    }
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    return this.resourcex.ingest<T>(locator, args);
  }
}

/** Create a Rolex instance from a Platform. */
export async function createRoleX(platform: Platform): Promise<Rolex> {
  return Rolex.create(platform);
}
