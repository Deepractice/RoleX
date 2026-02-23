/**
 * RoleX CLI — thin wrapper over the Rolex API.
 *
 * Namespaces:
 *   rolex individual  — lifecycle (born, retire, die, rehire, teach, train)
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
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.individual.retire(args.individual), args.individual);
  },
});

const die_ = defineCommand({
  meta: { name: "die", description: "An individual dies (permanent)" },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.individual.die(args.individual), args.individual);
  },
});

const rehire = defineCommand({
  meta: { name: "rehire", description: "Rehire a retired individual from past" },
  args: {
    pastNode: { type: "positional" as const, description: "Past node id", required: true },
  },
  run({ args }) {
    output(rolex.individual.rehire(args.pastNode), args.pastNode);
  },
});

const teach = defineCommand({
  meta: {
    name: "teach",
    description: "Inject a principle directly into an individual's knowledge",
  },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("principle"),
    id: { type: "string" as const, description: "Principle id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.individual.teach(
      args.individual,
      requireContent(args, "principle"),
      args.id
    );
    output(result, args.id ?? result.state.name);
  },
});

const train = defineCommand({
  meta: {
    name: "train",
    description: "Inject a procedure (skill) directly into an individual's knowledge",
  },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("procedure"),
    id: { type: "string" as const, description: "Procedure id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.individual.train(
      args.individual,
      requireContent(args, "procedure"),
      args.id
    );
    output(result, args.id ?? result.state.name);
  },
});

const individual = defineCommand({
  meta: { name: "individual", description: "Individual lifecycle management" },
  subCommands: {
    born,
    retire,
    die: die_,
    rehire,
    teach,
    train,
  },
});

// ========== Role — inner cycle ==========

const activate = defineCommand({
  meta: { name: "activate", description: "Activate a role (project individual state)" },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  async run({ args }) {
    output(await rolex.role.activate(args.individual), args.individual);
  },
});

const focus = defineCommand({
  meta: { name: "focus", description: "View or switch focused goal" },
  args: {
    goal: { type: "positional" as const, description: "Goal id", required: true },
  },
  run({ args }) {
    output(rolex.role.focus(args.goal), args.goal);
  },
});

const want = defineCommand({
  meta: { name: "want", description: "Declare a new goal" },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("goal"),
    id: { type: "string" as const, description: "Goal id for reference" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.role.want(
      args.individual,
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
    goal: { type: "positional" as const, description: "Goal id", required: true },
    ...contentArg("plan"),
    id: { type: "string" as const, description: "Plan id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.role.plan(args.goal, resolveContent(args, "plan"), args.id);
    output(result, result.state.name);
  },
});

const todo = defineCommand({
  meta: { name: "todo", description: "Add a task to a plan" },
  args: {
    plan: { type: "positional" as const, description: "Plan id", required: true },
    ...contentArg("task"),
    id: { type: "string" as const, description: "Task id for reference" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.role.todo(args.plan, resolveContent(args, "task"), args.id, aliasList);
    output(result, result.state.name);
  },
});

const finish = defineCommand({
  meta: { name: "finish", description: "Finish a task — creates encounter" },
  args: {
    task: { type: "positional" as const, description: "Task id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    output(
      rolex.role.finish(args.task, args.individual, resolveContent(args, "encounter")),
      args.task
    );
  },
});

const complete = defineCommand({
  meta: { name: "complete", description: "Complete a plan — creates encounter" },
  args: {
    plan: { type: "positional" as const, description: "Plan id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    output(
      rolex.role.complete(args.plan, args.individual, resolveContent(args, "encounter")),
      args.plan
    );
  },
});

const abandon = defineCommand({
  meta: { name: "abandon", description: "Abandon a plan — creates encounter" },
  args: {
    plan: { type: "positional" as const, description: "Plan id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("encounter"),
  },
  run({ args }) {
    output(
      rolex.role.abandon(args.plan, args.individual, resolveContent(args, "encounter")),
      args.plan
    );
  },
});

const reflect = defineCommand({
  meta: { name: "reflect", description: "Reflect on encounter — creates experience" },
  args: {
    encounter: { type: "positional" as const, description: "Encounter id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("experience"),
    id: { type: "string" as const, description: "Experience id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.role.reflect(
      args.encounter,
      args.individual,
      resolveContent(args, "experience"),
      args.id
    );
    output(result, result.state.name);
  },
});

const realize = defineCommand({
  meta: { name: "realize", description: "Distill experience into a principle" },
  args: {
    experience: { type: "positional" as const, description: "Experience id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("principle"),
    id: { type: "string" as const, description: "Principle id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.role.realize(
      args.experience,
      args.individual,
      resolveContent(args, "principle"),
      args.id
    );
    output(result, result.state.name);
  },
});

const master = defineCommand({
  meta: { name: "master", description: "Distill experience into a procedure" },
  args: {
    individual: { type: "positional" as const, description: "Individual id", required: true },
    ...contentArg("procedure"),
    id: { type: "string" as const, description: "Procedure id (keywords joined by hyphens)" },
    experience: { type: "string" as const, description: "Experience id to consume (optional)" },
  },
  run({ args }) {
    const result = rolex.role.master(
      args.individual,
      requireContent(args, "procedure"),
      args.id,
      args.experience
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
    complete,
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
    org: { type: "positional" as const, description: "Organization id", required: true },
    ...contentArg("position"),
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.org.establish(
      args.org,
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
    org: { type: "positional" as const, description: "Organization id", required: true },
    ...contentArg("charter"),
  },
  run({ args }) {
    output(rolex.org.charter(args.org, requireContent(args, "charter")), args.org);
  },
});

const charge = defineCommand({
  meta: { name: "charge", description: "Add a duty to a position" },
  args: {
    position: { type: "positional" as const, description: "Position id", required: true },
    ...contentArg("duty"),
    id: { type: "string" as const, description: "Duty id (keywords joined by hyphens)" },
  },
  run({ args }) {
    const result = rolex.org.charge(args.position, requireContent(args, "duty"), args.id);
    output(result, result.state.name);
  },
});

const dissolve = defineCommand({
  meta: { name: "dissolve", description: "Dissolve an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization id", required: true },
  },
  run({ args }) {
    output(rolex.org.dissolve(args.org), args.org);
  },
});

const abolish = defineCommand({
  meta: { name: "abolish", description: "Abolish a position" },
  args: {
    position: { type: "positional" as const, description: "Position id", required: true },
  },
  run({ args }) {
    output(rolex.org.abolish(args.position), args.position);
  },
});

const hire = defineCommand({
  meta: { name: "hire", description: "Hire an individual into an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.org.hire(args.org, args.individual), args.org);
  },
});

const fire = defineCommand({
  meta: { name: "fire", description: "Fire an individual from an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.org.fire(args.org, args.individual), args.org);
  },
});

const appoint = defineCommand({
  meta: { name: "appoint", description: "Appoint an individual to a position" },
  args: {
    position: { type: "positional" as const, description: "Position id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.org.appoint(args.position, args.individual), args.position);
  },
});

const dismiss = defineCommand({
  meta: { name: "dismiss", description: "Dismiss an individual from a position" },
  args: {
    position: { type: "positional" as const, description: "Position id", required: true },
    individual: { type: "positional" as const, description: "Individual id", required: true },
  },
  run({ args }) {
    output(rolex.org.dismiss(args.position, args.individual), args.position);
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
    registry: { type: "string" as const, description: "Registry URL (overrides default)" },
  },
  async run({ args }) {
    const rx = requireResource();
    const opts = args.registry ? { registry: args.registry } : undefined;
    await rx.push(args.locator, opts);
    consola.success(`Pushed ${args.locator}`);
  },
});

const rxPull = defineCommand({
  meta: { name: "pull", description: "Pull a resource from the remote registry" },
  args: {
    locator: { type: "positional" as const, description: "Resource locator", required: true },
    registry: { type: "string" as const, description: "Registry URL (overrides default)" },
  },
  async run({ args }) {
    const rx = requireResource();
    const opts = args.registry ? { registry: args.registry } : undefined;
    await rx.pull(args.locator, opts);
    consola.success(`Pulled ${args.locator}`);
  },
});

const rxRegistryAdd = defineCommand({
  meta: { name: "add", description: "Add a registry" },
  args: {
    name: { type: "positional" as const, description: "Registry name", required: true },
    url: { type: "positional" as const, description: "Registry URL", required: true },
    default: { type: "boolean" as const, description: "Set as default registry" },
  },
  run({ args }) {
    const rx = requireResource();
    rx.addRegistry(args.name, args.url, args.default);
    consola.success(`Added registry "${args.name}" (${args.url})`);
  },
});

const rxRegistryRemove = defineCommand({
  meta: { name: "remove", description: "Remove a registry" },
  args: {
    name: { type: "positional" as const, description: "Registry name", required: true },
  },
  run({ args }) {
    const rx = requireResource();
    rx.removeRegistry(args.name);
    consola.success(`Removed registry "${args.name}"`);
  },
});

const rxRegistryList = defineCommand({
  meta: { name: "list", description: "List configured registries" },
  run() {
    const rx = requireResource();
    const registries = rx.registries();
    if (registries.length === 0) {
      consola.info("No registries configured.");
    } else {
      for (const r of registries) {
        const marker = r.default ? " (default)" : "";
        console.log(`${r.name}: ${r.url}${marker}`);
      }
    }
  },
});

const rxRegistrySetDefault = defineCommand({
  meta: { name: "set-default", description: "Set a registry as default" },
  args: {
    name: { type: "positional" as const, description: "Registry name", required: true },
  },
  run({ args }) {
    const rx = requireResource();
    rx.setDefaultRegistry(args.name);
    consola.success(`Set "${args.name}" as default registry`);
  },
});

const rxRegistry = defineCommand({
  meta: { name: "registry", description: "Manage registries" },
  subCommands: {
    add: rxRegistryAdd,
    remove: rxRegistryRemove,
    list: rxRegistryList,
    "set-default": rxRegistrySetDefault,
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
    registry: rxRegistry,
  },
});

// ========== Prototype — register ResourceX source ==========

const prototype = defineCommand({
  meta: { name: "prototype", description: "Register a ResourceX source as a prototype" },
  args: {
    source: {
      type: "positional" as const,
      description: "ResourceX source — local path or locator",
      required: true,
    },
  },
  async run({ args }) {
    const result = await rolex.prototype(args.source);
    output(result, result.state.id ?? args.source);
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
    prototype,
  },
});

runMain(main);
