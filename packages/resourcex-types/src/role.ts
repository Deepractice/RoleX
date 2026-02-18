/**
 * Role type for ResourceX.
 *
 * A role resource contains:
 *   - individual.json  (manifest)
 *   - *.feature        (Gherkin content)
 *
 * Resolves to a State tree (plain object) for prototype merging.
 */
import type { BundledType } from "resourcexjs";
import { resolverCode } from "./resolver.js";

export const roleType: BundledType = {
  name: "role",
  aliases: ["individual"],
  description: "RoleX role prototype — individual manifest + feature files",
  code: resolverCode("role", "individual.json"),
};
