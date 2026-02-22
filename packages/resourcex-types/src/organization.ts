/**
 * Organization type for ResourceX.
 *
 * An organization resource contains:
 *   - organization.json  (manifest)
 *   - *.feature          (Gherkin content)
 *
 * Resolves to a State tree (plain object) for prototype merging.
 */
import type { BundledType } from "resourcexjs";
import { resolverCode } from "./resolver.js";

export const organizationType: BundledType = {
  name: "organization",
  aliases: ["org"],
  description: "RoleX organization prototype — organization manifest + feature files",
  code: resolverCode("organization", "organization.json"),
};
