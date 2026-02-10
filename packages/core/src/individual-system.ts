/**
 * Individual System — the role's first-person cognitive lifecycle.
 *
 * 12 processes (all active, first-person):
 *   identity, focus, want, design, todo,
 *   finish, achieve, abandon, synthesize, reflect, skill, use
 *
 * External processes (born, teach, train, retire, kill)
 * belong to the Role System (role-system.ts).
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { Process, ProcessContext, RunnableSystem } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import type { ResourceX } from "resourcexjs";
import { t } from "./i18n/index.js";
import {
  WANT, DESIGN, TODO,
  FINISH, ACHIEVE, ABANDON, FORGET, SYNTHESIZE, REFLECT,
  IDENTITY, FOCUS, SKILL, USE,
} from "./individual.js";

// ========== Helpers ==========

/** Parse Gherkin source into a Feature. */
function parseSource(source: string, type: Feature["type"]): Feature {
  const doc = parse(source);
  const gherkin = doc.feature!;
  const scenarios: Scenario[] = (gherkin.children || [])
    .filter((c) => c.scenario)
    .map((c) => ({
      ...c.scenario!,
      verifiable: c.scenario!.tags.some((t) => t.name === "@testable"),
    }));
  return { ...gherkin, type, scenarios };
}

function renderFeature(f: Feature): string {
  const tag = f.type ? `# type: ${f.type}` : "";
  const name = f.name ?? "";
  return `${tag}\n${name}`.trim();
}

function renderFeatures(features: Feature[]): string {
  return features.map(renderFeature).join("\n\n");
}

/** Get current role name from context, or throw. */
function role(ctx: ProcessContext<Feature>): string {
  if (!ctx.structure) throw new Error(t(ctx.locale, "error.noRole"));
  return ctx.structure;
}

/** Get the focused goal name via Relation, or throw. */
function focusedGoal(ctx: ProcessContext<Feature>): string {
  const names = ctx.platform.listRelations("focus", ctx.structure);
  if (names.length === 0) throw new Error(t(ctx.locale, "error.noGoal"));
  return names[0];
}

// ========== Optional experience schema ==========

const experienceSchema = z.object({
  name: z.string().describe("Experience name"),
  source: z.string().describe("Gherkin source for the experience"),
}).optional();

// ========== Process Definitions ==========

const identity: Process<{ roleId: string }, Feature> = {
  ...IDENTITY,
  params: z.object({
    roleId: z.string().describe("Role name to activate"),
  }),
  execute(ctx, params) {
    ctx.structure = params.roleId;
    const persona = ctx.platform.listInformation(params.roleId, "persona");
    const knowledge = ctx.platform.listInformation(params.roleId, "knowledge");
    const procedure = ctx.platform.listInformation(params.roleId, "procedure");
    const experience = ctx.platform.listInformation(params.roleId, "experience");
    const all = [...persona, ...knowledge, ...procedure, ...experience];
    return `[${params.roleId}] ${t(ctx.locale, "individual.identity.loaded")}\n\n${renderFeatures(all)}`;
  },
};

const focus: Process<{ name?: string }, Feature> = {
  ...FOCUS,
  params: z.object({
    name: z.string().optional().describe("Goal name to switch focus to"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    if (params.name) {
      const old = ctx.platform.listRelations("focus", r);
      for (const o of old) ctx.platform.removeRelation("focus", r, o);
      ctx.platform.addRelation("focus", r, params.name);
    }

    const focusList = ctx.platform.listRelations("focus", r);
    const focusName = focusList.length > 0 ? focusList[0] : null;

    if (!focusName) {
      const allGoals = ctx.platform.listInformation(r, "goal");
      const activeNames = allGoals
        .filter((g) => !g.tags?.some((t: any) => t.name === "@done" || t.name === "@abandoned"))
        .map((g) => g.name);
      const others = activeNames.join(", ");
      return `[${r}] ${t(l, "individual.focus.noGoal")}${others ? `\n${t(l, "individual.focus.otherGoals", { names: others })}` : ""}`;
    }

    const current = ctx.platform.readInformation(r, "goal", focusName);
    if (!current || current.tags?.some((t: any) => t.name === "@done" || t.name === "@abandoned")) {
      return `[${r}] ${t(l, "individual.focus.noGoalInactive")}`;
    }

    const plan = ctx.platform.readInformation(r, "plan", focusName);
    const tasks = ctx.platform.listInformation(r, "task");
    const planInfo = plan ? `\n${t(l, "individual.focus.plan", { name: plan.name })}` : `\n${t(l, "individual.focus.planNone")}`;
    const taskList = tasks.map((tk) => {
      const done = tk.tags?.some((tag: any) => tag.name === "@done") ? " @done" : "";
      return `  - ${tk.name}${done}`;
    }).join("\n");
    const tasksInfo = taskList ? `\n${t(l, "individual.focus.tasks")}\n${taskList}` : `\n${t(l, "individual.focus.tasksNone")}`;

    const allGoals = ctx.platform.listInformation(r, "goal");
    const otherNames = allGoals
      .filter((g) => g.name !== current.name && !g.tags?.some((t: any) => t.name === "@done" || t.name === "@abandoned"))
      .map((g) => g.name);
    const othersInfo = otherNames.length > 0 ? `\n${t(l, "individual.focus.otherGoals", { names: otherNames.join(", ") })}` : "";

    return `[${r}] ${t(l, "individual.focus.goal", { name: focusName })}${planInfo}${tasksInfo}${othersInfo}`;
  },
};

const want: Process<{ name: string; source: string }, Feature> = {
  ...WANT,
  params: z.object({
    name: z.string().describe("Goal name"),
    source: z.string().describe("Gherkin goal source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const feature = parseSource(params.source, "goal");
    ctx.platform.writeInformation(r, "goal", params.name, feature);
    if (ctx.platform.listRelations("focus", r).length === 0) {
      ctx.platform.addRelation("focus", r, params.name);
    }
    return `[${r}] ${t(ctx.locale, "individual.want.created", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const design: Process<{ source: string }, Feature> = {
  ...DESIGN,
  params: z.object({
    source: z.string().describe("Gherkin plan source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const goalName = focusedGoal(ctx);
    const feature = parseSource(params.source, "plan");
    ctx.platform.writeInformation(r, "plan", goalName, feature);
    return `[${r}] ${t(ctx.locale, "individual.design.created", { name: goalName })}\n\n${renderFeature(feature)}`;
  },
};

const todo: Process<{ name: string; source: string }, Feature> = {
  ...TODO,
  params: z.object({
    name: z.string().describe("Task name"),
    source: z.string().describe("Gherkin task source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const feature = parseSource(params.source, "task");
    ctx.platform.writeInformation(r, "task", params.name, feature);
    return `[${r}] ${t(ctx.locale, "individual.todo.created", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const finish: Process<{ name: string; experience?: { name: string; source: string } }, Feature> = {
  ...FINISH,
  params: z.object({
    name: z.string().describe("Task name to finish"),
    experience: experienceSchema,
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    const task = ctx.platform.readInformation(r, "task", params.name);
    if (!task) throw new Error(t(l, "error.taskNotFound", { name: params.name }));
    const updated = { ...task, tags: [...(task.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeInformation(r, "task", params.name, updated);

    let output = `[${r}] ${t(l, "individual.finish.done", { name: params.name })}`;

    if (params.experience) {
      const exp = parseSource(params.experience.source, "experience");
      ctx.platform.writeInformation(r, "experience", params.experience.name, exp);
      output += `\n${t(l, "individual.finish.synthesized", { name: params.experience.name })}`;
    }

    return output;
  },
};

const achieve: Process<{ experience?: { name: string; source: string } }, Feature> = {
  ...ACHIEVE,
  params: z.object({
    experience: experienceSchema,
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;
    const goalName = focusedGoal(ctx);

    const goal = ctx.platform.readInformation(r, "goal", goalName);
    if (!goal) throw new Error(t(l, "error.goalNotFound", { name: goalName }));
    const updated = { ...goal, tags: [...(goal.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeInformation(r, "goal", goalName, updated);

    let output = `[${r}] ${t(l, "individual.achieve.done", { name: goalName })}`;

    if (params.experience) {
      const exp = parseSource(params.experience.source, "experience");
      ctx.platform.writeInformation(r, "experience", params.experience.name, exp);
      output += `\n${t(l, "individual.finish.synthesized", { name: params.experience.name })}`;
    }

    return output;
  },
};

const abandon: Process<{ experience?: { name: string; source: string } }, Feature> = {
  ...ABANDON,
  params: z.object({
    experience: experienceSchema,
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;
    const goalName = focusedGoal(ctx);

    const goal = ctx.platform.readInformation(r, "goal", goalName);
    if (!goal) throw new Error(t(l, "error.goalNotFound", { name: goalName }));
    const updated = { ...goal, tags: [...(goal.tags || []), { name: "@abandoned" }] } as Feature;
    ctx.platform.writeInformation(r, "goal", goalName, updated);

    let output = `[${r}] ${t(l, "individual.abandon.done", { name: goalName })}`;

    if (params.experience) {
      const exp = parseSource(params.experience.source, "experience");
      ctx.platform.writeInformation(r, "experience", params.experience.name, exp);
      output += `\n${t(l, "individual.finish.synthesized", { name: params.experience.name })}`;
    }

    return output;
  },
};

const FORGETTABLE_TYPES = ["knowledge", "experience", "procedure"] as const;

const forget: Process<{ type: string; name: string }, Feature> = {
  ...FORGET,
  params: z.object({
    type: z.enum(FORGETTABLE_TYPES).describe("Information type: knowledge, experience, or procedure"),
    name: z.string().describe("Name of the information to forget"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const existing = ctx.platform.readInformation(r, params.type, params.name);
    if (!existing) {
      throw new Error(t(ctx.locale, "error.informationNotFound", { type: params.type, name: params.name }));
    }
    ctx.platform.removeInformation(r, params.type, params.name);
    return `[${r}] ${t(ctx.locale, "individual.forget.done", { type: params.type, name: params.name })}`;
  },
};

const synthesize: Process<{ name: string; source: string }, Feature> = {
  ...SYNTHESIZE,
  params: z.object({
    name: z.string().describe("Experience name"),
    source: z.string().describe("Gherkin experience source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const feature = parseSource(params.source, "experience");
    ctx.platform.writeInformation(r, "experience", params.name, feature);
    return `[${r}] ${t(ctx.locale, "individual.synthesize.done", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const reflect: Process<{ experienceNames: string[]; knowledgeName: string; knowledgeSource: string }, Feature> = {
  ...REFLECT,
  params: z.object({
    experienceNames: z.array(z.string()).describe("Experience names to consume"),
    knowledgeName: z.string().describe("Knowledge name to produce"),
    knowledgeSource: z.string().describe("Gherkin knowledge source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    if (params.experienceNames.length === 0) {
      throw new Error(t(l, "error.experienceRequired"));
    }

    for (const expName of params.experienceNames) {
      const exists = ctx.platform.readInformation(r, "experience", expName);
      if (!exists) throw new Error(t(l, "error.experienceNotFound", { name: expName }));
    }

    const feature = parseSource(params.knowledgeSource, "knowledge");
    ctx.platform.writeInformation(r, "knowledge", params.knowledgeName, feature);

    for (const expName of params.experienceNames) {
      ctx.platform.removeInformation(r, "experience", expName);
    }

    return `[${r}] ${t(l, "individual.reflect.done", { from: params.experienceNames.join(", "), to: params.knowledgeName })}\n\n${renderFeature(feature)}`;
  },
};

const skill: Process<{ name: string }, Feature> = {
  ...SKILL,
  params: z.object({
    name: z.string().describe("Procedure name to load"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const feature = ctx.platform.readInformation(r, "procedure", params.name);
    if (!feature) throw new Error(t(ctx.locale, "error.procedureNotFound", { name: params.name }));

    // Try to load SKILL.md from path in Feature description
    const desc = (feature.description || "").trim();
    if (desc && ctx.platform.readFile) {
      const content = ctx.platform.readFile(desc);
      if (content) {
        return `[${r}] ${t(ctx.locale, "individual.skill.done", { name: params.name })}\n\n${content}`;
      }
    }

    // Fallback: render full Gherkin procedure
    return `[${r}] ${t(ctx.locale, "individual.skill.done", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

/** Create the use process — needs ResourceX instance for tool execution. */
function createUseProcess(rx: ResourceX): Process<{ locator: string; args?: unknown }, Feature> {
  return {
    ...USE,
    params: z.object({
      locator: z.string().describe("Resource locator (e.g. 'tool-name:1.0.0')"),
      args: z.unknown().optional().describe("Arguments to pass to the tool"),
    }),
    async execute(ctx, params) {
      const r = role(ctx);
      const executable = await rx.use(params.locator);
      const result = await executable.execute(params.args);
      return `[${r}] ${t(ctx.locale, "individual.use.done", { name: params.locator })}\n\n${typeof result === "string" ? result : JSON.stringify(result, null, 2)}`;
    },
  };
}

// ========== System Factory ==========

/** Create the individual system, ready to execute. */
export function createIndividualSystem(platform: Platform, rx?: ResourceX): RunnableSystem<Feature> {
  const processes: Record<string, Process<any, Feature>> = {
    identity, focus,
    want, design, todo,
    finish, achieve, abandon,
    forget, synthesize, reflect,
    skill,
  };

  if (rx) {
    processes.use = createUseProcess(rx);
  }

  return defineSystem(platform, {
    name: "individual",
    description: "A single role's cognitive lifecycle — birth, learning, goal pursuit, growth.",
    processes,
  });
}
