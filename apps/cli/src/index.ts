#!/usr/bin/env node
/**
 * RoleX CLI — stateless command layer over the Rolex API.
 *
 * Every Rolex method = one CLI command. Same names, same semantics.
 * All node references are passed as explicit IDs.
 */

import { defineCommand, runMain } from "citty";
import consola from "consola";
import { readFileSync } from "node:fs";
import { createRoleX, describe, hint } from "rolexjs";
import type { RolexResult } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";

// ========== Setup ==========

const rolex = createRoleX(localPlatform());

// ========== Helpers ==========

function resolveSource(args: { source?: string; file?: string }): string | undefined {
  if (args.file) return readFileSync(args.file, "utf-8");
  if (args.source) return args.source.replace(/\\n/g, "\n");
  return undefined;
}

function requireSource(args: { source?: string; file?: string }): string {
  const src = resolveSource(args);
  if (!src) throw new Error("Either --source or --file is required.");
  return src;
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

const sourceArgs = {
  source: { type: "string" as const, description: "Gherkin Feature source" },
  file: { type: "string" as const, alias: "f", description: "Path to .feature file" },
};

// ========== Lifecycle — Creation ==========

const born = defineCommand({
  meta: { name: "born", description: "Born an individual into society" },
  args: {
    ...sourceArgs,
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.born(resolveSource(args), args.id, aliasList);
    output(result, args.id ?? result.state.name);
  },
});

const found = defineCommand({
  meta: { name: "found", description: "Found an organization" },
  args: {
    ...sourceArgs,
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.found(resolveSource(args), args.id, aliasList);
    output(result, args.id ?? result.state.name);
  },
});

const establish = defineCommand({
  meta: { name: "establish", description: "Establish a position within an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    ...sourceArgs,
    id: { type: "string" as const, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string" as const, description: "Comma-separated aliases" },
  },
  run({ args }) {
    const aliasList = args.alias ? args.alias.split(",").map((a: string) => a.trim()) : undefined;
    const result = rolex.establish(ref(args.org), resolveSource(args), args.id, aliasList);
    output(result, args.id ?? result.state.name);
  },
});

const charter = defineCommand({
  meta: { name: "charter", description: "Define the charter for an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.charter(ref(args.org), requireSource(args));
    output(result, result.state.name);
  },
});

const charge = defineCommand({
  meta: { name: "charge", description: "Add a duty to a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.charge(ref(args.position), requireSource(args));
    output(result, result.state.name);
  },
});

// ========== Lifecycle — Archival ==========

const retire = defineCommand({
  meta: { name: "retire", description: "Retire an individual (can rehire later)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.retire(ref(args.individual)), "individual");
  },
});

const die_ = defineCommand({
  meta: { name: "die", description: "An individual dies (permanent)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.die(ref(args.individual)), "individual");
  },
});

const dissolve = defineCommand({
  meta: { name: "dissolve", description: "Dissolve an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
  },
  run({ args }) {
    output(rolex.dissolve(ref(args.org)), "organization");
  },
});

const abolish = defineCommand({
  meta: { name: "abolish", description: "Abolish a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
  },
  run({ args }) {
    output(rolex.abolish(ref(args.position)), "position");
  },
});

const rehire = defineCommand({
  meta: { name: "rehire", description: "Rehire a retired individual from past" },
  args: {
    pastNode: { type: "positional" as const, description: "Past node ref", required: true },
  },
  run({ args }) {
    output(rolex.rehire(ref(args.pastNode)), "individual");
  },
});

// ========== Organization ==========

const hire = defineCommand({
  meta: { name: "hire", description: "Hire an individual into an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.hire(ref(args.org), ref(args.individual)), "organization");
  },
});

const fire = defineCommand({
  meta: { name: "fire", description: "Fire an individual from an organization" },
  args: {
    org: { type: "positional" as const, description: "Organization node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.fire(ref(args.org), ref(args.individual)), "organization");
  },
});

const appoint = defineCommand({
  meta: { name: "appoint", description: "Appoint an individual to a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.appoint(ref(args.position), ref(args.individual)), "position");
  },
});

const dismiss = defineCommand({
  meta: { name: "dismiss", description: "Dismiss an individual from a position" },
  args: {
    position: { type: "positional" as const, description: "Position node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.dismiss(ref(args.position), ref(args.individual)), "position");
  },
});

// ========== Role ==========

const activate = defineCommand({
  meta: { name: "activate", description: "Activate a role (project individual state)" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
  },
  run({ args }) {
    output(rolex.activate(ref(args.individual)), "individual");
  },
});

// ========== Execution ==========

const want = defineCommand({
  meta: { name: "want", description: "Declare a new goal" },
  args: {
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.want(ref(args.individual), resolveSource(args));
    output(result, result.state.name);
  },
});

const plan = defineCommand({
  meta: { name: "plan", description: "Create a plan for a goal" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.plan(ref(args.goal), resolveSource(args));
    output(result, result.state.name);
  },
});

const todo = defineCommand({
  meta: { name: "todo", description: "Add a task to a plan" },
  args: {
    plan: { type: "positional" as const, description: "Plan node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.todo(ref(args.plan), resolveSource(args));
    output(result, result.state.name);
  },
});

const finish = defineCommand({
  meta: { name: "finish", description: "Finish a task — creates encounter" },
  args: {
    task: { type: "positional" as const, description: "Task node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    experience: { type: "string" as const, description: "What was learned" },
  },
  run({ args }) {
    const result = rolex.finish(ref(args.task), ref(args.individual), args.experience);
    output(result, result.state.name);
  },
});

const achieve = defineCommand({
  meta: { name: "achieve", description: "Achieve a goal — creates encounter" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    experience: { type: "string" as const, description: "What was learned" },
  },
  run({ args }) {
    const result = rolex.achieve(ref(args.goal), ref(args.individual), args.experience);
    output(result, result.state.name);
  },
});

const abandon = defineCommand({
  meta: { name: "abandon", description: "Abandon a goal — creates encounter" },
  args: {
    goal: { type: "positional" as const, description: "Goal node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    experience: { type: "string" as const, description: "What was learned" },
  },
  run({ args }) {
    const result = rolex.abandon(ref(args.goal), ref(args.individual), args.experience);
    output(result, result.state.name);
  },
});

// ========== Cognition ==========

const reflect = defineCommand({
  meta: { name: "reflect", description: "Reflect on encounter — creates experience" },
  args: {
    encounter: { type: "positional" as const, description: "Encounter node ref", required: true },
    individual: { type: "positional" as const, description: "Individual node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.reflect(ref(args.encounter), ref(args.individual), resolveSource(args));
    output(result, result.state.name);
  },
});

const realize = defineCommand({
  meta: { name: "realize", description: "Distill experience into a principle" },
  args: {
    experience: { type: "positional" as const, description: "Experience node ref", required: true },
    knowledge: { type: "positional" as const, description: "Knowledge node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.realize(ref(args.experience), ref(args.knowledge), resolveSource(args));
    output(result, result.state.name);
  },
});

const master = defineCommand({
  meta: { name: "master", description: "Distill experience into a skill" },
  args: {
    experience: { type: "positional" as const, description: "Experience node ref", required: true },
    knowledge: { type: "positional" as const, description: "Knowledge node ref", required: true },
    ...sourceArgs,
  },
  run({ args }) {
    const result = rolex.master(ref(args.experience), ref(args.knowledge), resolveSource(args));
    output(result, result.state.name);
  },
});

// ========== Query ==========

const project = defineCommand({
  meta: { name: "project", description: "Project a node's full state" },
  args: {
    node: { type: "positional" as const, description: "Node ref", required: true },
  },
  run({ args }) {
    const state = rolex.project(ref(args.node));
    consola.log(JSON.stringify(state, null, 2));
  },
});

// ========== Main ==========

const main = defineCommand({
  meta: {
    name: "rolex",
    version: "0.10.0",
    description: "RoleX — AI Agent Role Management CLI",
  },
  subCommands: {
    // Lifecycle
    born, found, establish, charter, charge,
    retire, die: die_, dissolve, abolish, rehire,
    // Organization
    hire, fire, appoint, dismiss,
    // Role
    activate,
    // Execution
    want, plan, todo, finish, achieve, abandon,
    // Cognition
    reflect, realize, master,
    // Query
    project,
  },
});

runMain(main);
