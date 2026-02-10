/**
 * Individual System — the role's first-person cognitive lifecycle.
 *
 * 14 processes (all active, first-person):
 *   identity, focus, explore, want, design, todo,
 *   finish, achieve, abandon, forget, reflect, contemplate, skill, use
 *
 * External processes (born, teach, train, retire, kill)
 * belong to the Role System (role-system.ts).
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { Process, ProcessContext, RunnableSystem, BaseProvider } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import type { ResourceX } from "resourcexjs";
import { t } from "./i18n/index.js";
import {
  WANT, DESIGN, TODO,
  FINISH, ACHIEVE, ABANDON, FORGET, REFLECT, CONTEMPLATE,
  IDENTITY, FOCUS, SKILL, USE, EXPLORE,
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
  const lines: string[] = [];

  // Type tag (RoleX metadata, not Gherkin)
  if (f.type) lines.push(`# type: ${f.type}`);

  // Feature line
  lines.push(`Feature: ${f.name || ""}`);

  // Description
  if (f.description) {
    for (const line of f.description.split("\n")) {
      lines.push(`  ${line.trimEnd()}`);
    }
  }

  // Scenarios with steps
  const children = (f.children || []) as any[];
  for (const child of children) {
    if (!child.scenario) continue;
    const sc = child.scenario;
    lines.push("");

    const stags = sc.tags || [];
    if (stags.length > 0) {
      lines.push(`  ${stags.map((t: any) => t.name).join(" ")}`);
    }

    lines.push(`  Scenario: ${sc.name || ""}`);
    if (sc.description) {
      for (const line of sc.description.split("\n")) {
        lines.push(`    ${line.trimEnd()}`);
      }
    }

    for (const step of sc.steps || []) {
      lines.push(`    ${step.keyword}${step.text}`);
    }
  }

  return lines.join("\n");
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
    // Role must exist — unless it's a built-in base role (auto-create)
    if (!ctx.platform.hasStructure(params.roleId)) {
      const baseFeatures = ctx.base?.listIdentity(params.roleId) ?? [];
      if (baseFeatures.length > 0) {
        ctx.platform.createStructure(params.roleId);
      } else {
        throw new Error(t(ctx.locale, "error.roleNotFound", { name: params.roleId }));
      }
    }

    ctx.structure = params.roleId;

    // Base identity (common + role-specific, from package)
    const baseFeatures = ctx.base?.listIdentity(params.roleId) ?? [];

    // Local identity (from platform storage)
    const persona = ctx.platform.listInformation(params.roleId, "persona");
    const pattern = ctx.platform.listInformation(params.roleId, "knowledge.pattern");
    const procedure = ctx.platform.listInformation(params.roleId, "knowledge.procedure");
    const theory = ctx.platform.listInformation(params.roleId, "knowledge.theory");
    const insight = ctx.platform.listInformation(params.roleId, "experience.insight");
    const conclusion = ctx.platform.listInformation(params.roleId, "experience.conclusion");

    const all = [...baseFeatures, ...persona, ...pattern, ...procedure, ...theory, ...insight, ...conclusion];
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

    // Switch focus if name provided
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

    const sections: string[] = [];

    // Header
    sections.push(`[${r}] ${t(l, "individual.focus.goal", { name: focusName })}`);

    // Goal — full Gherkin
    sections.push(renderFeature(current));

    // Plans — via relation
    const planNames = ctx.platform.listRelations(`has-plan.${focusName}`, r);
    const focusPlanList = ctx.platform.listRelations(`focus-plan.${focusName}`, r);
    const focusPlanName = focusPlanList.length > 0 ? focusPlanList[0] : null;

    if (planNames.length > 0) {
      sections.push(`---\n${t(l, "individual.focus.plans", { name: focusPlanName || "none" })}`);
      for (const pn of planNames) {
        const plan = ctx.platform.readInformation(r, "plan", pn);
        if (plan) {
          const marker = pn === focusPlanName ? " [focused]" : "";
          sections.push(`[${pn}]${marker}\n${renderFeature(plan)}`);
        }
      }
    } else {
      sections.push(`---\n${t(l, "individual.focus.plansNone")}`);
    }

    // Tasks — via relation (focused plan only)
    if (focusPlanName) {
      const taskNames = ctx.platform.listRelations(`has-task.${focusPlanName}`, r);
      if (taskNames.length > 0) {
        sections.push(`---\n${t(l, "individual.focus.tasks", { name: focusPlanName })}`);
        for (const tn of taskNames) {
          const task = ctx.platform.readInformation(r, "task", tn);
          if (task) {
            const done = task.tags?.some((tag: any) => tag.name === "@done") ? " @done" : "";
            sections.push(`[${tn}]${done}\n${renderFeature(task)}`);
          }
        }
      } else {
        sections.push(`---\n${t(l, "individual.focus.tasksNone")}`);
      }
    } else {
      sections.push(`---\n${t(l, "individual.focus.tasksNone")}`);
    }

    // Other active goals
    const allGoals = ctx.platform.listInformation(r, "goal");
    const otherNames = allGoals
      .filter((g) => g.name !== current.name && !g.tags?.some((t: any) => t.name === "@done" || t.name === "@abandoned"))
      .map((g) => g.name);
    if (otherNames.length > 0) {
      sections.push(`---\n${t(l, "individual.focus.otherGoals", { names: otherNames.join(", ") })}`);
    }

    return sections.join("\n\n");
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
    // Always focus on the new goal
    const oldFocus = ctx.platform.listRelations("focus", r);
    for (const o of oldFocus) ctx.platform.removeRelation("focus", r, o);
    ctx.platform.addRelation("focus", r, params.name);
    return `[${r}] ${t(ctx.locale, "individual.want.created", { name: params.name })}\n\n${renderFeature(feature)}`;
  },
};

const design: Process<{ name: string; source: string }, Feature> = {
  ...DESIGN,
  params: z.object({
    name: z.string().describe("Plan name"),
    source: z.string().describe("Gherkin plan source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const goalName = focusedGoal(ctx);
    const feature = parseSource(params.source, "plan");

    // Store plan
    ctx.platform.writeInformation(r, "plan", params.name, feature);

    // Relation: goal → plan
    ctx.platform.addRelation(`has-plan.${goalName}`, r, params.name);

    // Auto focus-plan (replace old)
    const old = ctx.platform.listRelations(`focus-plan.${goalName}`, r);
    for (const o of old) ctx.platform.removeRelation(`focus-plan.${goalName}`, r, o);
    ctx.platform.addRelation(`focus-plan.${goalName}`, r, params.name);

    return `[${r}] ${t(ctx.locale, "individual.design.created", { name: params.name, goal: goalName })}\n\n${renderFeature(feature)}`;
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
    const goalName = focusedGoal(ctx);

    // Get focused plan
    const plans = ctx.platform.listRelations(`focus-plan.${goalName}`, r);
    if (plans.length === 0) throw new Error(t(ctx.locale, "error.noPlan"));
    const planName = plans[0];

    const feature = parseSource(params.source, "task");
    ctx.platform.writeInformation(r, "task", params.name, feature);

    // Relation: plan → task
    ctx.platform.addRelation(`has-task.${planName}`, r, params.name);

    return `[${r}] ${t(ctx.locale, "individual.todo.created", { name: params.name, plan: planName })}\n\n${renderFeature(feature)}`;
  },
};

const finish: Process<{ name: string; conclusion?: string }, Feature> = {
  ...FINISH,
  params: z.object({
    name: z.string().describe("Task name to finish"),
    conclusion: z.string().optional().describe("Gherkin — task completion summary"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    const task = ctx.platform.readInformation(r, "task", params.name);
    if (!task) throw new Error(t(l, "error.taskNotFound", { name: params.name }));
    const updated = { ...task, tags: [...(task.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeInformation(r, "task", params.name, updated);

    let output = `[${r}] ${t(l, "individual.finish.done", { name: params.name })}`;

    if (params.conclusion) {
      const conclusionFeature = parseSource(params.conclusion, "experience.conclusion");
      ctx.platform.writeInformation(r, "experience.conclusion", params.name, conclusionFeature);
      output += `\n${t(l, "individual.finish.conclusion", { name: params.name })}`;
    }

    return output;
  },
};

const achieve: Process<{ conclusion: string; experience: { name: string; source: string } }, Feature> = {
  ...ACHIEVE,
  params: z.object({
    conclusion: z.string().describe("Gherkin — goal-level summary"),
    experience: z.object({
      name: z.string().describe("Experience name"),
      source: z.string().describe("Gherkin — distilled experience"),
    }).describe("Experience to synthesize into identity"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;
    const goalName = focusedGoal(ctx);

    const goal = ctx.platform.readInformation(r, "goal", goalName);
    if (!goal) throw new Error(t(l, "error.goalNotFound", { name: goalName }));
    const updated = { ...goal, tags: [...(goal.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeInformation(r, "goal", goalName, updated);

    // Write conclusion
    const conclusionFeature = parseSource(params.conclusion, "experience.conclusion");
    ctx.platform.writeInformation(r, "experience.conclusion", goalName, conclusionFeature);

    // Write insight
    const exp = parseSource(params.experience.source, "experience.insight");
    ctx.platform.writeInformation(r, "experience.insight", params.experience.name, exp);

    let output = `[${r}] ${t(l, "individual.achieve.done", { name: goalName })}`;
    output += `\n${t(l, "individual.achieve.conclusion", { name: goalName })}`;
    output += `\n${t(l, "individual.achieve.synthesized", { name: params.experience.name })}`;

    return output;
  },
};

const abandon: Process<{ conclusion?: string; experience?: { name: string; source: string } }, Feature> = {
  ...ABANDON,
  params: z.object({
    conclusion: z.string().optional().describe("Gherkin — why abandoned"),
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

    if (params.conclusion) {
      const conclusionFeature = parseSource(params.conclusion, "experience.conclusion");
      ctx.platform.writeInformation(r, "experience.conclusion", goalName, conclusionFeature);
      output += `\n${t(l, "individual.abandon.conclusion", { name: goalName })}`;
    }

    if (params.experience) {
      const exp = parseSource(params.experience.source, "experience.insight");
      ctx.platform.writeInformation(r, "experience.insight", params.experience.name, exp);
      output += `\n${t(l, "individual.abandon.synthesized", { name: params.experience.name })}`;
    }

    return output;
  },
};

const FORGETTABLE_TYPES = ["knowledge.pattern", "knowledge.procedure", "knowledge.theory", "experience.insight"] as const;

const forget: Process<{ type: string; name: string }, Feature> = {
  ...FORGET,
  params: z.object({
    type: z.enum(FORGETTABLE_TYPES).describe("Information type: knowledge.pattern, knowledge.procedure, knowledge.theory, or experience.insight"),
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
      const exists = ctx.platform.readInformation(r, "experience.insight", expName);
      if (!exists) throw new Error(t(l, "error.experienceNotFound", { name: expName }));
    }

    const feature = parseSource(params.knowledgeSource, "knowledge.pattern");
    ctx.platform.writeInformation(r, "knowledge.pattern", params.knowledgeName, feature);

    for (const expName of params.experienceNames) {
      ctx.platform.removeInformation(r, "experience.insight", expName);
    }

    return `[${r}] ${t(l, "individual.reflect.done", { from: params.experienceNames.join(", "), to: params.knowledgeName })}\n\n${renderFeature(feature)}`;
  },
};

const contemplate: Process<{ patternNames: string[]; theoryName: string; theorySource: string }, Feature> = {
  ...CONTEMPLATE,
  params: z.object({
    patternNames: z.array(z.string()).describe("Pattern names to contemplate"),
    theoryName: z.string().describe("Theory name to produce"),
    theorySource: z.string().describe("Gherkin theory source"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    if (params.patternNames.length === 0) {
      throw new Error(t(l, "error.patternRequired"));
    }

    for (const pn of params.patternNames) {
      const exists = ctx.platform.readInformation(r, "knowledge.pattern", pn);
      if (!exists) throw new Error(t(l, "error.patternNotFound", { name: pn }));
    }

    const feature = parseSource(params.theorySource, "knowledge.theory");
    ctx.platform.writeInformation(r, "knowledge.theory", params.theoryName, feature);

    // Patterns are NOT consumed — theory is a view across patterns, patterns retain independent value
    return `[${r}] ${t(l, "individual.contemplate.done", { from: params.patternNames.join(", "), to: params.theoryName })}\n\n${renderFeature(feature)}`;
  },
};

/** Create the skill process — resolves ResourceX locator directly. */
function createSkillProcess(rx?: ResourceX): Process<{ name: string }, Feature> {
  return {
    ...SKILL,
    params: z.object({
      name: z.string().describe("ResourceX locator (e.g. 'role-management:0.1.0')"),
    }),
    async execute(ctx, params) {
      const r = role(ctx);
      if (!rx) throw new Error("ResourceX not available");
      const executable = await rx.use(params.name);
      const content = await executable.execute();
      return `[${r}] ${t(ctx.locale, "individual.skill.done", { name: params.name })}\n\n${typeof content === "string" ? content : JSON.stringify(content, null, 2)}`;
    },
  };
}

const explore: Process<{ name?: string }, Feature> = {
  ...EXPLORE,
  params: z.object({
    name: z.string().optional().describe("Name of role or organization to explore"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;

    if (!params.name) {
      // Build tree view of the RoleX world
      const all = ctx.platform.listStructures();
      const roles: string[] = [];
      const orgs: string[] = [];
      for (const name of all) {
        const charter = ctx.platform.readInformation(name, "charter", "charter");
        if (charter) {
          orgs.push(name);
        } else {
          roles.push(name);
        }
      }

      // Role-centric view: show roles first (people), then orgs (just names)
      const items = [...roles, ...orgs];
      const lines: string[] = [`[${r}] RoleX World`];

      if (items.length === 0) {
        lines.push("└── (empty)");
      }

      for (let i = 0; i < items.length; i++) {
        const name = items[i];
        const isLast = i === items.length - 1;
        const prefix = isLast ? "└── " : "├── ";

        if (orgs.includes(name)) {
          lines.push(`${prefix}${name} (org)`);
        } else {
          // Role — show org/position context
          let context = "";
          for (const orgName of orgs) {
            if (ctx.platform.hasRelation("membership", orgName, name)) {
              const pos = ctx.platform.listRelations("assignment", name);
              context = pos.length > 0 ? ` → ${orgName}/${pos.join(", ")}` : ` → ${orgName}`;
              break;
            }
          }
          lines.push(`${prefix}${name}${context}`);
        }
      }

      return lines.join("\n");
    }

    // Detail view of a specific structure
    if (!ctx.platform.hasStructure(params.name)) {
      throw new Error(t(l, "error.roleNotFound", { name: params.name }));
    }

    const sections: string[] = [];
    sections.push(`[${r}] ${t(l, "individual.explore.detail", { name: params.name })}`);

    // Check if org (has charter)
    const charter = ctx.platform.readInformation(params.name, "charter", "charter");
    if (charter) {
      sections.push(renderFeature(charter));
      const subs = ctx.platform.listStructures(params.name);
      const subPositions: string[] = [];
      const subOrgs: string[] = [];
      for (const s of subs) {
        const subCharter = ctx.platform.readInformation(s, "charter", "charter");
        if (subCharter) {
          subOrgs.push(s);
        } else {
          subPositions.push(s);
        }
      }
      if (subPositions.length > 0) {
        sections.push(`positions: ${subPositions.join(", ")}`);
      }
      if (subOrgs.length > 0) {
        sections.push(`sub-orgs: ${subOrgs.join(", ")}`);
      }
      const members = ctx.platform.listRelations("membership", params.name);
      if (members.length > 0) {
        sections.push(`members: ${members.join(", ")}`);
      }
      return sections.join("\n\n");
    }

    // Otherwise it's a role
    const persona = ctx.platform.listInformation(params.name, "persona");
    if (persona.length > 0) {
      sections.push(renderFeatures(persona));
      const patterns = ctx.platform.listInformation(params.name, "knowledge.pattern");
      const procedures = ctx.platform.listInformation(params.name, "knowledge.procedure");
      const theories = ctx.platform.listInformation(params.name, "knowledge.theory");
      const insights = ctx.platform.listInformation(params.name, "experience.insight");
      const goals = ctx.platform.listInformation(params.name, "goal")
        .filter(g => !g.tags?.some((tg: any) => tg.name === "@done" || tg.name === "@abandoned"));
      sections.push(t(l, "individual.explore.roleInfo", {
        patterns: patterns.length, procedures: procedures.length,
        theories: theories.length, insights: insights.length,
        goals: goals.length,
      }));

      // Show org membership and positions
      const allStructures = ctx.platform.listStructures();
      const memberOf: string[] = [];
      for (const s of allStructures) {
        const ch = ctx.platform.readInformation(s, "charter", "charter");
        if (ch && ctx.platform.hasRelation("membership", s, params.name)) {
          memberOf.push(s);
        }
      }
      if (memberOf.length > 0) sections.push(`org: ${memberOf.join(", ")}`);
      const positionList = ctx.platform.listRelations("assignment", params.name);
      if (positionList.length > 0) sections.push(`position: ${positionList.join(", ")}`);

      return sections.join("\n\n");
    }

    // Role without persona — show what we have
    const patterns = ctx.platform.listInformation(params.name, "knowledge.pattern");
    const procedures = ctx.platform.listInformation(params.name, "knowledge.procedure");
    const theories = ctx.platform.listInformation(params.name, "knowledge.theory");
    const insights = ctx.platform.listInformation(params.name, "experience.insight");
    const goals = ctx.platform.listInformation(params.name, "goal")
      .filter(g => !g.tags?.some((tg: any) => tg.name === "@done" || tg.name === "@abandoned"));
    sections.push(t(l, "individual.explore.roleInfo", {
      patterns: patterns.length, procedures: procedures.length,
      theories: theories.length, insights: insights.length,
      goals: goals.length,
    }));

    const allStructures = ctx.platform.listStructures();
    const memberOf: string[] = [];
    for (const s of allStructures) {
      const ch = ctx.platform.readInformation(s, "charter", "charter");
      if (ch && ctx.platform.hasRelation("membership", s, params.name)) {
        memberOf.push(s);
      }
    }
    if (memberOf.length > 0) sections.push(`org: ${memberOf.join(", ")}`);
    const positionList = ctx.platform.listRelations("assignment", params.name);
    if (positionList.length > 0) sections.push(`position: ${positionList.join(", ")}`);

    return sections.join("\n\n");
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
export function createIndividualSystem(platform: Platform, rx?: ResourceX, base?: BaseProvider<Feature>): RunnableSystem<Feature> {
  const processes: Record<string, Process<any, Feature>> = {
    identity, focus, explore,
    want, design, todo,
    finish, achieve, abandon,
    forget, reflect, contemplate,
    skill: createSkillProcess(rx),
  };

  if (rx) {
    processes.use = createUseProcess(rx);
  }

  return defineSystem(platform, {
    name: "individual",
    description: "A single role's cognitive lifecycle — birth, learning, goal pursuit, growth.",
    processes,
  }, base);
}
