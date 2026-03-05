/**
 * RoleXService — runtime orchestrator (internal).
 *
 * Wires Platform → Commands, manages Role lifecycle, handles ResourceX/IssueX.
 * Not exposed publicly — consumed by the RoleX entry point.
 *
 * Key responsibilities:
 *   - Initialize world roots (society, past)
 *   - Create and cache Role instances (one per individual)
 *   - Apply prototypes on first run
 *   - Dispatch direct commands
 */

import type { Initializer, Runtime, Structure } from "@rolexjs/system";
import { createIssueX, type IssueX } from "issuexjs";
import type { ResourceX } from "resourcexjs";
import { createResourceX, setProvider } from "resourcexjs";
import { applyPrototype } from "./apply.js";
import type { CommandResult, Commands } from "./commands.js";
import { createCommands } from "./commands.js";
import { directives } from "./directives/index.js";
import { toArgs } from "./dispatch.js";
import { findInState } from "./find.js";
import type { Platform, PrototypeData, RoleXRepository } from "./platform.js";
import type { Renderer } from "./renderer.js";
import { Role, type RoleSnapshot } from "./role-model.js";
import * as C from "./structures.js";

// ================================================================
//  RoleX — public interface
// ================================================================

export interface RoleX {
  activate(individual: string): Promise<Role>;
  direct<T = unknown>(
    locator: string,
    args?: Record<string, unknown>,
    options?: { raw?: boolean }
  ): Promise<T>;
}

// ================================================================
//  RoleXService — internal implementation
// ================================================================

export class RoleXService implements RoleX {
  private rt: Runtime;
  private commands!: Commands;
  private resourcex?: ResourceX;
  private issuex?: IssueX;
  private repo: RoleXRepository;
  private readonly initializer?: Initializer;
  private readonly renderer: Renderer;
  private readonly prototypes: readonly PrototypeData[];

  private society!: Structure;
  private past!: Structure;

  /** Cached Role instances — one per individual. */
  private readonly roles = new Map<string, Role>();

  private constructor(platform: Platform, renderer: Renderer) {
    this.repo = platform.repository;
    this.rt = this.repo.runtime;
    this.initializer = platform.initializer;
    this.prototypes = platform.prototypes ?? [];
    this.renderer = renderer;

    if (platform.resourcexProvider) {
      setProvider(platform.resourcexProvider);
      this.resourcex = createResourceX(
        platform.resourcexExecutor
          ? { isolator: "custom", executor: platform.resourcexExecutor }
          : undefined
      );
    }

    if (platform.issuexProvider) {
      this.issuex = createIssueX({ provider: platform.issuexProvider });
    }
  }

  static async create(platform: Platform, renderer: Renderer): Promise<RoleXService> {
    const service = new RoleXService(platform, renderer);
    await service.init();
    return service;
  }

  private async init(): Promise<void> {
    const roots = await this.rt.roots();
    this.society =
      roots.find((r) => r.name === "society") ?? (await this.rt.create(null, C.society));

    const societyState = await this.rt.project(this.society);
    const existingPast = societyState.children?.find((c) => c.name === "past");
    this.past = existingPast ?? (await this.rt.create(this.society, C.past));

    this.commands = createCommands({
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
      issuex: this.issuex,
      prototype: this.repo.prototype,
      direct: (locator: string, args?: Record<string, unknown>) =>
        this.direct(locator, args, { raw: true }),
    });

    await this.initializer?.bootstrap();
    for (const proto of this.prototypes) {
      await applyPrototype(proto, this.repo.prototype, (op, args) =>
        this.direct(op, args, { raw: true })
      );
    }
  }

  // ================================================================
  //  activate — create or retrieve a cached Role
  // ================================================================

  async activate(individual: string): Promise<Role> {
    // Return cached instance if available
    const cached = this.roles.get(individual);
    if (cached) {
      // Re-hydrate from latest state
      const node = await this.findOrAutoBorn(individual);
      const state = await this.rt.project(node);
      cached.hydrate(state);
      // Restore persisted snapshot
      await this.restoreSnapshot(cached);
      return cached;
    }

    const node = await this.findOrAutoBorn(individual);
    const state = await this.rt.project(node);

    const role = new Role(individual, {
      commands: this.commands,
      renderer: this.renderer,
      onSave: (snapshot: RoleSnapshot) => this.saveSnapshot(snapshot),
      direct: <T>(locator: string, args?: Record<string, unknown>) => this.direct<T>(locator, args),
    });

    role.hydrate(state);
    await this.restoreSnapshot(role);

    this.roles.set(individual, role);
    return role;
  }

  private async findOrAutoBorn(individual: string): Promise<Structure> {
    let node = await this.find(individual);
    if (!node) {
      const hasProto = Object.hasOwn(await this.repo.prototype.list(), individual);
      if (hasProto) {
        await this.commands["individual.born"](undefined, individual);
        node = (await this.find(individual))!;
      } else {
        throw new Error(`"${individual}" not found.`);
      }
    }
    return node;
  }

  // ================================================================
  //  Snapshot persistence — KV-compatible
  // ================================================================

  private async saveSnapshot(snapshot: RoleSnapshot): Promise<void> {
    await this.repo.saveContext(snapshot.id, {
      focusedGoalId: snapshot.focusedGoalId,
      focusedPlanId: snapshot.focusedPlanId,
    });
  }

  private async restoreSnapshot(role: Role): Promise<void> {
    const persisted = await this.repo.loadContext(role.id);
    if (!persisted) return;

    // Only restore if the persisted values are valid nodes under this individual
    const snap = role.snapshot();
    if (persisted.focusedGoalId) {
      snap.focusedGoalId = persisted.focusedGoalId;
    }
    if (persisted.focusedPlanId) {
      snap.focusedPlanId = persisted.focusedPlanId;
    }
    role.restore(snap);
  }

  // ================================================================
  //  direct — world-level command dispatch
  // ================================================================

  async direct<T = unknown>(
    locator: string,
    args?: Record<string, unknown>,
    options?: { raw?: boolean }
  ): Promise<T> {
    const shouldRender = !options?.raw;
    if (locator.startsWith("!")) {
      const command = locator.slice(1);
      const fn = this.commands[command];
      if (!fn) {
        const hint = directives["identity-ethics"]?.["on-unknown-command"] ?? "";
        throw new Error(
          `Unknown command "${locator}".\n\n` +
            "You may be guessing the command name. " +
            "Load the relevant skill first with skill(locator) to learn the correct syntax.\n\n" +
            hint
        );
      }
      const result = await fn(...toArgs(command, args ?? {}));
      if (shouldRender && isCommandResult(result)) {
        return this.renderer.render(command, result) as T;
      }
      return result as T;
    }
    if (!this.resourcex) throw new Error("ResourceX is not available.");
    return this.resourcex.ingest<T>(locator, args);
  }

  // ================================================================
  //  Internal helpers
  // ================================================================

  private async find(id: string): Promise<Structure | null> {
    const state = await this.rt.project(this.society);
    return findInState(state, id);
  }
}

function isCommandResult(value: unknown): value is CommandResult {
  return typeof value === "object" && value !== null && "state" in value && "process" in value;
}
