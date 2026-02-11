import { defineCommand, runMain } from "citty";
import { born } from "./commands/born.js";
import { found } from "./commands/found.js";
import { directory } from "./commands/directory.js";
import { hire } from "./commands/hire.js";
import { fire } from "./commands/fire.js";
import { establish } from "./commands/establish.js";
import { appoint } from "./commands/appoint.js";
import { teach } from "./commands/teach.js";
import { train } from "./commands/train.js";
import { identity } from "./commands/identity.js";

import { explore } from "./commands/explore.js";
import { focus } from "./commands/focus.js";
import { want } from "./commands/want.js";
import { plan } from "./commands/plan.js";
import { todo } from "./commands/todo.js";
import { achieve } from "./commands/achieve.js";
import { abandon } from "./commands/abandon.js";
import { finish } from "./commands/finish.js";
import { forget } from "./commands/forget.js";
import { reflect } from "./commands/reflect.js";
import { skill } from "./commands/skill.js";
import { setting } from "./commands/setting.js";

const role = defineCommand({
  meta: { name: "role", description: "Role System — born, teach, train" },
  subCommands: { born, teach, train },
});

const org = defineCommand({
  meta: { name: "org", description: "Organization System — found" },
  subCommands: { found },
});

const governance = defineCommand({
  meta: { name: "governance", description: "Governance System — hire, fire, directory" },
  subCommands: { hire, fire, establish, appoint, directory },
});

const individual = defineCommand({
  meta: {
    name: "individual",
    description:
      "Individual System — identity, focus, want, plan, todo, finish, achieve, abandon, reflect, skill",
  },
  subCommands: {
    identity,
    focus,
    explore,
    want,
    plan,
    todo,
    finish,
    achieve,
    abandon,
    forget,
    reflect,
    skill,
  },
});

const main = defineCommand({
  meta: {
    name: "rolex",
    version: "0.1.0",
    description: "RoleX — AI Agent Role Management CLI",
  },
  subCommands: { role, org, governance, individual, setting },
});

runMain(main);
