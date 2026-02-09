#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { born } from "./commands/born.js";
import { found } from "./commands/found.js";
import { directory } from "./commands/directory.js";
import { find } from "./commands/find.js";
import { hire } from "./commands/hire.js";
import { fire } from "./commands/fire.js";
import { teach } from "./commands/teach.js";
import { identity } from "./commands/identity.js";
import { synthesize } from "./commands/synthesize.js";
import { focus } from "./commands/focus.js";
import { want } from "./commands/want.js";
import { plan } from "./commands/plan.js";
import { todo } from "./commands/todo.js";
import { achieve } from "./commands/achieve.js";
import { abandon } from "./commands/abandon.js";
import { finish } from "./commands/finish.js";

const main = defineCommand({
  meta: {
    name: "rolex",
    version: "0.1.0",
    description: "Rolex — AI Agent Role Management CLI",
  },
  subCommands: {
    // Society
    born,
    found,
    directory,
    find,
    // Organization
    hire,
    fire,
    teach,
    // Role
    identity,
    synthesize,
    focus,
    want,
    plan,
    todo,
    achieve,
    abandon,
    finish,
  },
});

runMain(main);
