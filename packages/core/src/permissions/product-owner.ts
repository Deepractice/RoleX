/**
 * Product owner permissions — operations granted by the own relationship.
 *
 * The own relationship connects an individual to a product,
 * granting product management operations: strategy, spec,
 * release, channel, and deprecation.
 */
import type { Permission } from "@rolexjs/system";
import { processes } from "../descriptions/index.js";

const p = (command: string, key: string): Permission => ({
  command,
  content: processes[key],
});

export const productOwnerPermissions: readonly Permission[] = [
  p("product.strategy", "strategy"),
  p("product.spec", "spec"),
  p("product.release", "release"),
  p("product.channel", "channel"),
  p("product.deprecate", "deprecate"),
];
