/**
 * Genesis — the foundational prototype of the RoleX world.
 *
 * Exports a static PrototypeData with all migrations.
 * Feature content is inlined — no runtime file reading needed.
 */

import type { PrototypeData } from "@rolexjs/core";
import { V1__initial } from "./V1__initial.js";
import { V2__add_issue_management } from "./V2__add_issue_management.js";
import { V3__crown_and_cleanup } from "./V3__crown_and_cleanup.js";

export const genesis: PrototypeData = {
  id: "rolex-world",
  source: "@rolexjs/genesis",
  migrations: [V1__initial, V2__add_issue_management, V3__crown_and_cleanup],
};
