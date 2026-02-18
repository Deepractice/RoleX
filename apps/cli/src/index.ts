#!/usr/bin/env node

/**
 * RoleX CLI — stateless command layer over the Rolex API.
 *
 * Namespaces:
 *   rolex individual  — lifecycle (born, retire, die, rehire)
 *   rolex role        — inner cycle (activate, focus, want..master, project)
 *   rolex org         — organization (found, establish..dismiss)
 *   rolex resource    — ResourceX (use, search, has, info, add, remove, push, pull)
 */

import { readFileSync } from "node:fs";
import { localPlatform } from "@rolexjs/local-platform";
import { defineCommand, runMain } from "citty";
import consola from "consola";
import type { RolexResult } from "rolexjs";
import { createRoleX, describe, hint } from "rolexjs";

// ========== Setup ==========

const rolex = createRoleX(localPlatform());

// ========== Helpers ==========

/** Build CLI arg definition for a concept's Gherkin content. */
function contentArg(concept: string) {
  return {
    [concept]: {
      type: "string" as const,
      description: `Gherkin Feature source for the ${concept}`,
    },
    file: { type: "string" as const, alias: "f", description: "Path to .feature file" },
  };
}

/** Resolve content from either --<concept> or --file. */
function resolveContent(args: Record<string, any>, concept: string): string | undefined {
  if (args.file) return readFileSync(args.file, "utf-8");
  const value = args[concept];
  if (typeof value === "string") return value.replace(/\\n/g, "\n");
  return undefined;
}

/** Resolve content, throw if missing. */
function requireContent(args: Record<string, any>, concept: string): string {
  const content = resolveContent(args, concept);
  if (!content) throw new Error(`Either --${concept} or --file is required.`);
  return content;
}

function ref(id: string) {
  return { ref: id } as any;
}

function output(result: RolexResult, name: string) {
  consola.success(describe(result.process, name, result.state));
  if (result.state.ref) consola.info(`ref: ${result.state.ref}`);
  if (result.state.id) consola.info(`id: ${result.state.id}`);
  consola.info(hint(result.process));
}

function requireResource() {
  if (!rolex.resource)
    throw new Error("ResourceX is not available. Check your platform configuration.");
  return rolex.resource;
}

// ========== Individual — lifecycle ==========

const born = defineCommand({
  meta: { name: "born", description: "Born an individual into society" },
  args: {
    ...contentArg("individual"),
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.individual.born(resolveContent(args, "individual"), args.id, aliasList);
    output(result, args.id ?? result.state.name);
  },
});

const retire = defineCommand({
  meta: { name: "retire", description: "Retire an individual (can rehire later)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.individual.retire(ref(args.individual)), "individual");
  },
});

const die_ = defineCommand({
  meta: { name: "die", description: "An individual dies (permanent)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.individual.die(ref(args.individual)), "individual");
  },
});

const rehire = defineCommand({
  meta: { name: "rehire", description: "Rehire a retired individual from past" },
  args: {
    pastNode: { type: "positional" as const, description: "Past node ref", required: true },
  },
  run({ args }) {
    output(rolex.individual.rehire(ref(args.pastNode)), "individual");
  },
});

const individual = defineCommand({
  meta: { name: "individual", description: "Individual lifecycle management" },
  subCommands: {
    born,
    retire,
    die: die_,
    rehire,
  },
});

// ========== Role — inner cycle ==========

const activate = defineCommand({
  meta: { name: "activate", description: "Activate a role (project individual state)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  async run({ args }) {
    output(await rolex.role.activate(ref(args.individual)), "individual");
  },
});

const focus = defineCommand({
  meta: { name: "focus", description: "View or switch focused goal" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
  },
  run({ args }) {
    const result = rolex.role.focus(ref(args.goal));
    output(result, result.state.name);
  },
});

const want = defineCommand({
  meta: { name: "want", description: "Declare a new goal" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...contentArg("goal"),
    id: { type: "string" as const, description: "Goal id for reference" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.role.want(
      ref(args.individual),
      resolveContent(args, "goal"),
      args.id,
      aliasList
    );
    output(result, result.state.name);
  },
});

const plan = defineCommand({
  meta: { name: "plan", description: "Create a plan for a goal" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    ...contentArg("plan"),
  },
  run({ args }) {
    const result = rolex.role.plan(ref(args.goal), resolveContent(args, "plan"));
    output(result, result.state.name);
  },
});

const todo = defineCommand({
  meta: { name: "todo", description: "Add a task to a plan" },
  args: {
    plan: { type: "positional" as const, description: "Plan node ref", required: true },
    ...contentArg("task"),
    id: { type: "string" as const, description: "Task id for reference" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.role.todo(
      ref(args.plan),
      resolveContent(args, "task"),
      args.id,
      aliasList
    );
    output(result, result.state.name);
  },
});

const finish = defineCommand({
  meta: { name: "finish", description: "Finish a task — creates encounter" },
  args: {
    task: { type: "positional" as const, description: "Task node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    const result = rolex.role.finish(
      ref(args.task),
      ref(args.individual),
      resolveContent(args, "encounter")
    );
    output(result, result.state.name);
  },
});

const achieve = defineCommand({
  meta: { name: "achieve", description: "Achieve a goal — creates encounter" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    const result = rolex.role.achieve(
      ref(args.goal),
      ref(args.individual),
      resolveContent(args, "encounter")
    );
    output(result, result.state.name);
  },
});

const abandon = defineCommand({
  meta: { name: "abandon", description: "Abandon a goal — creates encounter" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    const result = rolex.role.abandon(
      ref(args.goal),
      ref(args.individual),
      resolveContent(args, "encounter")
    );
    output(result, result.state.name);
  },
});

const reflect = defineCommand({
  meta: { name: "reflect", description: "Reflect on encounter — creates experience" },
  args: {
    encounter: { type: "positional" as const, description: "Encounter node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...contentArg("experience"),
  },
  run({ args }) {
    const result = rolex.role.reflect(
      ref(args.encounter),
      ref(args.individual),
      resolveContent(args, "experience")
    );
    output(result, result.state.name);
  },
});

const realize = defineCommand({
  meta: { name: "realize", description: "Distill experience into a principle" },
  args: {
    experience: { type: "positional" as const, description: "Experience node ref", required: true },
    knowledge: { type: "positional" as const, description: "Knowledge node ref", required: true },
    ...contentArg("principle"),
  },
  run({ args }) {
    const result = rolex.role.realize(
      ref(args.experience),
      ref(args.knowledge),
      resolveContent(args, "principle")
    );
    output(result, result.state.name);
  },
});

const master = defineCommand({
  meta: { name: "master", description: "Distill experience into a procedure" },
  args: {
    experience: { type: "positional" as const, description: "Experience node ref", required: true },
    knowledge: { type: "positional" as const, description: "Knowledge node ref", required: true },
    ...contentArg("procedure"),
  },
  run({ args }) {
    const result = rolex.role.master(
      ref(args.experience),
      ref(args.knowledge),
      resolveContent(args, "procedure")
    );
    output(result, result.state.name);
  },
});

const use = defineCommand({
  meta: { name: "use", description: "Use a resource — interact with external resources" },
  args: {
    locator: {
      type: "positional" as const,
      description: "Resource locator (e.g. hello:1.0.0)",
      required: true,
    },
  },
  async run({ args }) {
    const result = await rolex.role.use(args.locator);
    if (typeof result === "string") {
      console.log(result);
    } else if (result instanceof Uint8Array) {
      process.stdout.write(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  },
});

const role = defineCommand({
  meta: { name: "role", description: "Role inner cycle — execution + cognition" },
  subCommands: {
    activate,
    focus,
    want,
    plan,
    todo,
    finish,
    achieve,
    abandon,
    reflect,
    realize,
    master,
    use,
  },
});

// ========== Org — organization management ==========

const found = defineCommand({
  meta: { name: "found", description: "Found an organization" },
  args: {
    ...contentArg("organization"),
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.org.found(resolveContent(args, "organization"), args.id, aliasList);
    output(result, args.id ?? result.state.name);
  },
});

const establish = defineCommand({
  meta: { name: "establish", description: "Establish a position within an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    ...contentArg("position"),
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.org.establish(
      ref(args.org),
      resolveContent(args, "position"),
      args.id,
      aliasList
    );
    output(result, args.id ?? result.state.name);
  },
});

const charter = defineCommand({
  meta: { name: "charter", description: "Define the charter for an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    ...contentArg("charter"),
  },
  run({ args }) {
    const result = rolex.org.charter(ref(args.org), requireContent(args, "charter"));
    output(result, result.state.name);
  },
});

const charge = defineCommand({
  meta: { name: "charge", description: "Add a duty to a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    ...contentArg("duty"),
  },
  run({ args }) {
    const result = rolex.org.charge(ref(args.position), requireContent(args, "duty"));
    output(result, result.state.name);
  },
});

const dissolve = defineCommand({
  meta: { name: "dissolve", description: "Dissolve an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.dissolve(ref(args.org)), "organization");
  },
});

const abolish = defineCommand({
  meta: { name: "abolish", description: "Abolish a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.abolish(ref(args.position)), "position");
  },
});

const hire = defineCommand({
  meta: { name: "hire", description: "Hire an individual into an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.hire(ref(args.org), ref(args.individual)), "organization");
  },
});

const fire = defineCommand({
  meta: { name: "fire", description: "Fire an individual from an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.fire(ref(args.org), ref(args.individual)), "organization");
  },
});

const appoint = defineCommand({
  meta: { name: "appoint", description: "Appoint an individual to a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.appoint(ref(args.position), ref(args.individual)), "position");
  },
});

const dismiss = defineCommand({
  meta: { name: "dismiss", description: "Dismiss an individual from a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.org.dismiss(ref(args.position), ref(args.individual)), "position");
  },
});

const org = defineCommand({
  meta: { name: "org", description: "Organization management" },
  subCommands: {
    found,
    establish,
    charter,
    charge,
    dissolve,
    abolish,
    hire,
    fire,
    appoint,
    dismiss,
  },
});

// ========== Resource — ResourceX ==========

const rxSearch = defineCommand({
  meta: { name: "search", description: "Search available resources" },
  args: {
    query: { type: "positional" as const, description: "Search query" },
  },
  async run({ args }) {
    const rx = requireResource();
    const results = await rx.search(args.query);
    if (results.length === 0) {
      consola.info("No resources found.");
    } else {
      for (const locator of results) {
        console.log(locator);
      }
    }
  },
});

const rxHas = defineCommand({
  meta: { name: "has", description: "Check if a resource exists" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
  },
  async run({ args }) {
    const rx = requireResource();
    const exists = await rx.has(args.locator);
    console.log(exists ? "yes" : "no");
    process.exitCode = exists ? 0 : 1;
  },
});

const rxInfo = defineCommand({
  meta: { name: "info", description: "Get resource metadata" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
  },
  async run({ args }) {
    const rx = requireResource();
    const info = await rx.info(args.locator);
    console.log(JSON.stringify(info, null, 2));
  },
});

const rxAdd = defineCommand({
  meta: { name: "add", description: "Add a resource from a local directory" },
  args: {
    path: {
      type: "positional" as const,
      description: "Path to resource directory",
      required: true,
    },
  },
  async run({ args }) {
    const rx = requireResource();
    const resource = await rx.add(args.path);
    consola.success(`Added ${resource.locator}`);
  },
});

const rxRemove = defineCommand({
  meta: { name: "remove", description: "Remove a resource" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
  },
  async run({ args }) {
    const rx = requireResource();
    await rx.remove(args.locator);
    consola.success(`Removed ${args.locator}`);
  },
});

const rxPush = defineCommand({
  meta: { name: "push", description: "Push a resource to the remote registry" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
  },
  async run({ args }) {
    const rx = requireResource();
    await rx.push(args.locator);
    consola.success(`Pushed ${args.locator}`);
  },
});

const rxPull = defineCommand({
  meta: { name: "pull", description: "Pull a resource from the remote registry" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
  },
  async run({ args }) {
    const rx = requireResource();
    await rx.pull(args.locator);
    consola.success(`Pulled ${args.locator}`);
  },
});

const resource = defineCommand({
  meta: { name: "resource", description: "Resource management (powered by ResourceX)" },
  subCommands: {
    search: rxSearch,
    has: rxHas,
    info: rxInfo,
    add: rxAdd,
    remove: rxRemove,
    push: rxPush,
    pull: rxPull,
  },
});

// ========== Main ==========

const main = defineCommand({
  meta: {
    name: "rolex",
    version: "0.11.0",
    description: "RoleX — AI Agent Role Management CLI",
  },
  subCommands: {
    individual,
    role,
    org,
    resource,
  },
});

runMain(main);
