/**
 * RoleX — thin entry point.
 *
 * Public API:
 *   activate(id) — returns a stateful Role handle
 *   direct(loc, args) — direct the world to execute an instruction
 *
 * Delegates to RoleXService (core) for all runtime logic.
 * rolexjs adds the concrete renderer and issue rendering transform.
 */

import {
  type RoleX as IRoleX,
  type Platform,
  type Renderer,
  type Role,
  RoleXService,
} from "@rolexjs/core";
import { createRendererRouter } from "./renderers/index.js";

export class RoleX implements IRoleX {
  private service: RoleXService;

  private constructor(service: RoleXService) {
    this.service = service;
  }

  static async create(platform: Platform, renderer?: Renderer): Promise<RoleX> {
    const r = renderer ?? createRendererRouter();
    const service = await RoleXService.create(platform, r);
    return new RoleX(service);
  }

  async activate(individual: string): Promise<Role> {
    return this.service.activate(individual);
  }

  async inspect(id: string): Promise<string> {
    return this.service.inspect(id);
  }

  async survey(type?: string): Promise<string> {
    return this.service.survey(type);
  }

  async direct<T = unknown>(
    locator: string,
    args?: Record<string, unknown>,
    options?: { raw?: boolean }
  ): Promise<T> {
    return this.service.direct<T>(locator, args, options);
  }
}

/** Create a RoleX instance from a Platform. */
export async function createRoleX(platform: Platform, renderer?: Renderer): Promise<RoleX> {
  return RoleX.create(platform, renderer);
}
