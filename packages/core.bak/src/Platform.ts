/**
 * RoleX Platform — Platform<Feature>.
 *
 * All RoleX systems use Feature (Gherkin) as information.
 * This binds the generic Platform to Feature for the entire RoleX domain.
 */

import type { Platform as GenericPlatform } from "@rolexjs/system";
import type { Feature } from "./Feature.js";

export type Platform = GenericPlatform<Feature>;
