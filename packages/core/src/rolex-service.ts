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

import type { Initializer, Runtime, State, Structure } from "@rolexjs/system";
import { applyPrototype } from "./apply.js";
import type { CommandResult, Commands } from "./commands/index.js";
import { createCommands } from "./commands/index.js";
import { directives } from "./directives/index.js";
import { toArgs } from "./dispatch.js";
import { findInState } from "./find.js";
import { orgAdminPermissions } from "./permissions/org-admin.js";
import { productOwnerPermissions } from "./permissions/product-owner.js";
import { projectMaintainerPermissions } from "./permissions/project-maintainer.js";
import { PermissionRegistry } from "./permissions/registry.js";
import { sovereignPermissions } from "./permissions/sovereign.js";
import type { Platform, PrototypeData, RoleXRepository } from "./platform.js";
import { createProjection, type Projection } from "./projection.js";
import type { Renderer } from "./renderer.js";
import { Role, type RoleSnapshot } from "./role-model.js";
import * as C from "./structures.js";

// ================================================================
//  RoleX — public interface
// ================================================================

export interface RoleX {
  activate(individual: string): Promise<Role>;
  inspect(id: string, options?: { raw?: boolean }): Promise<string | State>;
  survey(type?: string, options?: { raw?: boolean }): Promise<string | readonly State[]>;
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
  private project!: Projection;
  private repo: RoleXRepository;
  private readonly initializer?: Initializer;
  private readonly renderer: Renderer;
  private readonly prototypes: readonly PrototypeData[];

  private society!: Structure;
  private past!: Structure;

  /** Cached Role instances — one per individual. */
  private readonly roles = new Map<string, Role>();

  /** Expose commands for the RPC handler. */
  get commandMap(): Commands {
    return this.commands;
  }

  /** Permission registry — maps relation names to permissions. */
  private readonly permissions = new PermissionRegistry()
    .register("crowned", sovereignPermissions)
    .register("administer", orgAdminPermissions)
    .register("maintained-by", projectMaintainerPermissions)
    .register("own", productOwnerPermissions);

  private constructor(
    platform: Platform,
    renderer: Renderer,
    prototypes?: readonly PrototypeData[]
  ) {
    this.repo = platform.repository;
    this.rt = this.repo.runtime;
    this.initializer = platform.initializer;
    this.prototypes = prototypes ?? [];
    this.renderer = renderer;
  }

  static async create(
    platform: Platform,
    renderer: Renderer,
    prototypes?: readonly PrototypeData[]
  ): Promise<RoleXService> {
    const service = new RoleXService(platform, renderer, prototypes);
    await service.init();
    return service;
  }

  private async init(): Promise<void> {
    // Create the unified projection pipeline: raw → compact(depth) → enrich
    this.project = createProjection(this.rt, this.permissions);

    const roots = await this.rt.roots();
    this.society =
      roots.find((r) => r.name === "society") ?? (await this.rt.create(null, C.society));

    const societyState = await this.project(this.society);
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
      project: this.project,
      prototype: this.repo.prototype,
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
      const state = await this.project(node);
      cached.hydrate(state);
      // Restore persisted snapshot
      await this.restoreSnapshot(cached);
      return cached;
    }

    const node = await this.findOrAutoBorn(individual);
    const state = await this.project(node);

    const role = new Role(individual, {
      commands: this.commands,
      renderer: this.renderer,
      onSave: (snapshot: RoleSnapshot) => this.saveSnapshot(snapshot),
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
        await this.commands["society.born"](undefined, individual);
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
  //  inspect — project any node's subtree
  // ================================================================

  async inspect(id: string, options?: { raw?: boolean }): Promise<string | State> {
    const node = await this.find(id);
    if (!node) throw new Error(`"${id}" not found.`);
    const state = await this.project(node);
    if (options?.raw) return state;
    const result: CommandResult = { state, process: "inspect" };
    return this.renderer.render("inspect", result);
  }

  // ================================================================
  //  survey — world-level overview
  // ================================================================

  async survey(type?: string, options?: { raw?: boolean }): Promise<string | readonly State[]> {
    const target = type === "past" ? this.past : this.society;
    const state = await this.project(target);
    const children = state.children ?? [];
    const filtered =
      type === "past"
        ? children
        : children.filter((c) => (type ? c.name === type : c.name !== "past"));
    if (options?.raw) return filtered;
    const result: CommandResult = { state: { ...state, children: filtered }, process: "list" };
    return this.renderer.render("survey.list", result);
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
    const command = locator.startsWith("!") ? locator.slice(1) : locator;
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

  // ================================================================
  //  Internal helpers
  // ================================================================

  /** Find a node by id across the entire society tree (raw, no pipeline). */
  private async find(id: string): Promise<Structure | null> {
    const raw = await this.rt.project(this.society);
    return findInState(raw, id);
  }
}

function isCommandResult(value: unknown): value is CommandResult {
  return typeof value === "object" && value !== null && "state" in value && "process" in value;
}
