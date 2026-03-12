/**
 * RoleX — builder entry point.
 *
 * Usage:
 *   import { createRoleX } from "rolexjs";
 *
 *   const rx = createRoleX({ platform });
 *   const role = await rx.individual.activate({ individual: "sean" });
 *   await rx.society.born({ id: "alice", content: "Feature: Alice" });
 */

import { createBuilder, type Platform, type Renderer, type RoleXBuilder } from "@rolexjs/core";
import { genesis } from "@rolexjs/genesis";
import { createRendererRouter } from "./renderers/index.js";

export interface RoleXConfig {
  platform: Platform;
  renderer?: Renderer;
}

/** Create a RoleX builder. Synchronous — initialization is lazy. Genesis is built-in. */
export function createRoleX(config: RoleXConfig): RoleXBuilder {
  return createBuilder({
    platform: config.platform,
    renderer: config.renderer ?? createRendererRouter(),
    prototypes: [genesis],
  });
}
