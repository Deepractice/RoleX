/**
 * RoleX CLI — thin assembly layer.
 *
 * All commands are auto-derived from system process definitions.
 * Only special behaviors (session management, settings) are configured here.
 */

import { defineCommand, runMain } from "citty";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { systemToCli } from "./lib/system-cli.js";
import { createClient } from "./lib/client.js";
import { createHydratedClient, saveActiveRole } from "./lib/session.js";
import { setting } from "./commands/setting.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

// Create a client once at startup to read process definitions (cheap — no I/O except graph load)
const rolex = createClient();

// ========== System → CLI (auto-derived) ==========

const role = systemToCli(
  { name: "role", description: rolex.role.description || "Role System — born, teach, train" },
  rolex.role.processes,
  { getSystem: () => createClient().role }
);

const org = systemToCli(
  { name: "org", description: rolex.org.description || "Organization System — found, dissolve" },
  rolex.org.processes,
  { getSystem: () => createClient().org }
);

const governance = systemToCli(
  {
    name: "governance",
    description: rolex.governance.description || "Governance System — hire, fire, establish, appoint",
  },
  rolex.governance.processes,
  { getSystem: () => createClient().governance }
);

const individual = systemToCli(
  {
    name: "individual",
    description:
      rolex.individual.description ||
      "Individual System — identity, focus, want, design, todo, finish, achieve, abandon, reflect, skill",
  },
  rolex.individual.processes,
  {
    getSystem: async () => (await createHydratedClient()).individual,
    overrides: {
      identity: {
        // identity uses fresh client (it IS the hydration), then saves session
        getSystem: () => createClient().individual,
        afterExecute: (_result, rawArgs) => {
          saveActiveRole(rawArgs.roleId);
        },
      },
    },
  }
);

// ========== Main ==========

const main = defineCommand({
  meta: {
    name: "rolex",
    version: pkg.version,
    description: "RoleX — AI Agent Role Management CLI",
  },
  subCommands: { role, org, governance, individual, setting },
});

runMain(main);
