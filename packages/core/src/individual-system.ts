/**
 * Individual System — the role's first-person cognitive lifecycle.
 *
 * 14 processes (all active, first-person):
 *   identity, focus, explore, want, design, todo,
 *   finish, achieve, abandon, forget, reflect, contemplate, skill, use
 *
 * Uses graph primitives for topology (ctx.graph)
 * and platform for content persistence (ctx.platform).
 */

import { z } from "zod";
import { defineSystem } from "@rolexjs/system";
import { parse } from "@rolexjs/parser";
import type { GraphModel, Process, ProcessContext, RunnableSystem, BaseProvider } from "@rolexjs/system";
import type { Platform } from "./Platform.js";
import type { Feature } from "./Feature.js";
import type { Scenario } from "./Scenario.js";
import type { ResourceX } from "resourcexjs";
import { t } from "./i18n/index.js";
import {
  WANT,
  DESIGN,
  TODO,
  FINISH,
  ACHIEVE,
  ABANDON,
  FORGET,
  REFLECT,
  CONTEMPLATE,
  IDENTITY,
  FOCUS,
  SKILL,
  USE,
  EXPLORE,
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

/** Get the focused goal key from role state, or throw. */
function focusedGoal(ctx: ProcessContext<Feature>): string {
  const r = role(ctx);
  const state = ctx.graph.getNode(r)?.state;
  const goalKey = state?.focus as string | undefined;
  if (!goalKey) throw new Error(t(ctx.locale, "error.noGoal"));
  return goalKey;
}

/** Get active (non-shadow) outbound neighbors by edge type. */
function activeOut(ctx: ProcessContext<Feature>, key: string, edgeType?: string): string[] {
  return ctx.graph.outNeighbors(key, edgeType).filter((k) => !ctx.graph.getNode(k)?.shadow);
}

/** Read content for all node keys, returning Features. */
function readContents(ctx: ProcessContext<Feature>, keys: string[]): Feature[] {
  const results: Feature[] = [];
  for (const key of keys) {
    const content = ctx.platform.readContent(key);
    if (content) results.push(content);
  }
  return results;
}

// ========== Optional experience schema ==========

const experienceSchema = z
  .object({
    name: z.string().describe("Experience name"),
    source: z.string().describe("Gherkin source for the experience"),
  })
  .optional();

// ========== Process Definitions ==========

const identity: Process<{ roleId: string }, Feature> = {
  ...IDENTITY,
  params: z.object({
    roleId: z.string().describe("Role name to activate"),
  }),
  execute(ctx, params) {
    // Role must exist — unless it's a built-in base role (auto-create)
    if (!ctx.graph.hasNode(params.roleId)) {
      const baseFeatures = ctx.base?.listIdentity(params.roleId) ?? [];
      if (baseFeatures.length > 0) {
        ctx.graph.addNode(params.roleId, "role");
      } else {
        throw new Error(t(ctx.locale, "error.roleNotFound", { name: params.roleId }));
      }
    }

    ctx.structure = params.roleId;

    // Base identity (common + role-specific, from package)
    const baseFeatures = ctx.base?.listIdentity(params.roleId) ?? [];

    // Local identity — all non-shadow info nodes linked to this role
    const infoKeys = activeOut(ctx, params.roleId, "has-info");
    const localFeatures = readContents(ctx, infoKeys);

    const all = [...baseFeatures, ...localFeatures];
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
      const goalKey = `${r}/${params.name}`;
      ctx.graph.updateNode(r, { state: { ...ctx.graph.getNode(r)!.state, focus: goalKey } });
    }

    const focusGoalKey = ctx.graph.getNode(r)?.state?.focus as string | undefined;

    if (!focusGoalKey || !ctx.graph.hasNode(focusGoalKey) || ctx.graph.getNode(focusGoalKey)!.shadow) {
      // No active focused goal
      const allGoalKeys = activeOut(ctx, r, "has-goal");
      const goalNames = allGoalKeys.map((k) => k.split("/").pop());
      const others = goalNames.join(", ");
      return `[${r}] ${t(l, "individual.focus.noGoal")}${others ? `\n${t(l, "individual.focus.otherGoals", { names: others })}` : ""}`;
    }

    const goalName = focusGoalKey.split("/").pop()!;
    const goalContent = ctx.platform.readContent(focusGoalKey);

    // Check if goal is done/abandoned
    if (!goalContent || goalContent.tags?.some((tg: any) => tg.name === "@done" || tg.name === "@abandoned")) {
      return `[${r}] ${t(l, "individual.focus.noGoalInactive")}`;
    }

    const sections: string[] = [];

    // Header
    sections.push(`[${r}] ${t(l, "individual.focus.goal", { name: goalName })}`);

    // Goal — full Gherkin
    sections.push(renderFeature(goalContent));

    // Plans — outbound from goal
    const planKeys = activeOut(ctx, focusGoalKey, "has-plan");
    const focusPlanKey = ctx.graph.getNode(focusGoalKey)?.state?.focusPlan as string | undefined;
    const focusPlanName = focusPlanKey ? focusPlanKey.split("/").pop() : null;

    if (planKeys.length > 0) {
      sections.push(`---\n${t(l, "individual.focus.plans", { name: focusPlanName || "none" })}`);
      for (const pk of planKeys) {
        const plan = ctx.platform.readContent(pk);
        if (plan) {
          const pName = pk.split("/").pop()!;
          const marker = pk === focusPlanKey ? " [focused]" : "";
          sections.push(`[${pName}]${marker}\n${renderFeature(plan)}`);
        }
      }
    } else {
      sections.push(`---\n${t(l, "individual.focus.plansNone")}`);
    }

    // Tasks — from focused plan
    if (focusPlanKey && ctx.graph.hasNode(focusPlanKey)) {
      const taskKeys = activeOut(ctx, focusPlanKey, "has-task");
      if (taskKeys.length > 0) {
        sections.push(`---\n${t(l, "individual.focus.tasks", { name: focusPlanName! })}`);
        for (const tk of taskKeys) {
          const task = ctx.platform.readContent(tk);
          if (task) {
            const tName = tk.split("/").pop()!;
            const done = task.tags?.some((tag: any) => tag.name === "@done") ? " @done" : "";
            sections.push(`[${tName}]${done}\n${renderFeature(task)}`);
          }
        }
      } else {
        sections.push(`---\n${t(l, "individual.focus.tasksNone")}`);
      }
    } else {
      sections.push(`---\n${t(l, "individual.focus.tasksNone")}`);
    }

    // Other active goals
    const otherGoalKeys = activeOut(ctx, r, "has-goal").filter((k) => k !== focusGoalKey);
    if (otherGoalKeys.length > 0) {
      const otherNames = otherGoalKeys.map((k) => k.split("/").pop()).join(", ");
      sections.push(`---\n${t(l, "individual.focus.otherGoals", { names: otherNames })}`);
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

    // Graph topology: goal node + relation
    const key = `${r}/${params.name}`;
    ctx.graph.addNode(key, "goal");
    ctx.graph.relateTo(r, key, "has-goal");

    // Content
    ctx.platform.writeContent(key, feature);

    // Auto focus
    ctx.graph.updateNode(r, { state: { ...ctx.graph.getNode(r)!.state, focus: key } });

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
    const goalKey = focusedGoal(ctx);
    const feature = parseSource(params.source, "plan");
    const goalName = goalKey.split("/").pop()!;

    // Graph topology: plan node + relation to goal
    const key = `${r}/${params.name}`;
    ctx.graph.addNode(key, "plan");
    ctx.graph.relateTo(goalKey, key, "has-plan");

    // Content
    ctx.platform.writeContent(key, feature);

    // Auto focus plan
    ctx.graph.updateNode(goalKey, { state: { ...ctx.graph.getNode(goalKey)!.state, focusPlan: key } });

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
    const goalKey = focusedGoal(ctx);

    // Get focused plan
    const planKey = ctx.graph.getNode(goalKey)?.state?.focusPlan as string | undefined;
    if (!planKey) throw new Error(t(ctx.locale, "error.noPlan"));
    const planName = planKey.split("/").pop()!;

    const feature = parseSource(params.source, "task");

    // Graph topology: task node + relation to plan
    const key = `${r}/${params.name}`;
    ctx.graph.addNode(key, "task");
    ctx.graph.relateTo(planKey, key, "has-task");

    // Content
    ctx.platform.writeContent(key, feature);

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
    const taskKey = `${r}/${params.name}`;

    const task = ctx.platform.readContent(taskKey);
    if (!task) throw new Error(t(l, "error.taskNotFound", { name: params.name }));

    // Mark done in content
    const updated = { ...task, tags: [...(task.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeContent(taskKey, updated);

    // Also mark done in graph state
    ctx.graph.updateNode(taskKey, { state: { ...ctx.graph.getNode(taskKey)!.state, done: true } });

    let output = `[${r}] ${t(l, "individual.finish.done", { name: params.name })}`;

    if (params.conclusion) {
      const conclusionFeature = parseSource(params.conclusion, "experience.conclusion");
      const conclusionKey = `${taskKey}-conclusion`;
      ctx.graph.addNode(conclusionKey, "experience.conclusion");
      ctx.graph.relateTo(taskKey, conclusionKey, "has-conclusion");
      ctx.platform.writeContent(conclusionKey, conclusionFeature);
      output += `\n${t(l, "individual.finish.conclusion", { name: params.name })}`;
    }

    return output;
  },
};

const achieve: Process<{ experience: { name: string; source: string } }, Feature> = {
  ...ACHIEVE,
  params: z.object({
    experience: z
      .object({
        name: z.string().describe("Experience name"),
        source: z.string().describe("Gherkin — distilled experience"),
      })
      .describe("Experience to synthesize into identity"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const l = ctx.locale;
    const goalKey = focusedGoal(ctx);
    const goalName = goalKey.split("/").pop()!;

    const goal = ctx.platform.readContent(goalKey);
    if (!goal) throw new Error(t(l, "error.goalNotFound", { name: goalName }));

    // Mark goal done in content
    const updated = { ...goal, tags: [...(goal.tags || []), { name: "@done" }] } as Feature;
    ctx.platform.writeContent(goalKey, updated);

    // Mark done in graph state
    ctx.graph.updateNode(goalKey, { state: { ...ctx.graph.getNode(goalKey)!.state, done: true } });

    // Write insight
    const exp = parseSource(params.experience.source, "experience.insight");
    const insightKey = `${r}/${params.experience.name}`;
    ctx.graph.addNode(insightKey, "experience.insight");
    ctx.graph.relateTo(r, insightKey, "has-info");
    ctx.platform.writeContent(insightKey, exp);

    // Consume task conclusions — shadow them
    const planKeys = activeOut(ctx, goalKey, "has-plan");
    let consumed = 0;
    for (const pk of planKeys) {
      const taskKeys = activeOut(ctx, pk, "has-task");
      for (const tk of taskKeys) {
        const conclusionKeys = ctx.graph.outNeighbors(tk, "has-conclusion");
        for (const ck of conclusionKeys) {
          ctx.graph.shadow(ck, false);
          consumed++;
        }
      }
    }

    let output = `[${r}] ${t(l, "individual.achieve.done", { name: goalName })}`;
    output += `\n${t(l, "individual.achieve.synthesized", { name: params.experience.name })}`;
    if (consumed > 0) {
      output += `\n${t(l, "individual.achieve.consumed", { count: String(consumed) })}`;
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
    const goalKey = focusedGoal(ctx);
    const goalName = goalKey.split("/").pop()!;

    // Shadow the goal — cascades to plans → tasks → conclusions
    ctx.graph.shadow(goalKey);

    let output = `[${r}] ${t(l, "individual.abandon.done", { name: goalName })}`;

    if (params.experience) {
      const exp = parseSource(params.experience.source, "experience.insight");
      const insightKey = `${r}/${params.experience.name}`;
      ctx.graph.addNode(insightKey, "experience.insight");
      ctx.graph.relateTo(r, insightKey, "has-info");
      ctx.platform.writeContent(insightKey, exp);
      output += `\n${t(l, "individual.abandon.synthesized", { name: params.experience.name })}`;
    }

    // Clear focus
    ctx.graph.updateNode(r, { state: { ...ctx.graph.getNode(r)!.state, focus: null } });

    return output;
  },
};

const FORGETTABLE_TYPES = [
  "knowledge.pattern",
  "knowledge.procedure",
  "knowledge.theory",
  "experience.insight",
] as const;

const forget: Process<{ type: string; name: string }, Feature> = {
  ...FORGET,
  params: z.object({
    type: z
      .enum(FORGETTABLE_TYPES)
      .describe(
        "Information type: knowledge.pattern, knowledge.procedure, knowledge.theory, or experience.insight"
      ),
    name: z.string().describe("Name of the information to forget"),
  }),
  execute(ctx, params) {
    const r = role(ctx);
    const key = `${r}/${params.name}`;

    if (!ctx.graph.hasNode(key)) {
      throw new Error(
        t(ctx.locale, "error.informationNotFound", { type: params.type, name: params.name })
      );
    }

    // Shadow the knowledge/insight node
    ctx.graph.shadow(key, false);

    return `[${r}] ${t(ctx.locale, "individual.forget.done", { type: params.type, name: params.name })}`;
  },
};

const reflect: Process<
  { experienceNames: string[]; knowledgeName: string; knowledgeSource: string },
  Feature
> = {
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

    // Verify all insights exist
    for (const expName of params.experienceNames) {
      const key = `${r}/${expName}`;
      if (!ctx.graph.hasNode(key) || ctx.graph.getNode(key)!.shadow) {
        throw new Error(t(l, "error.experienceNotFound", { name: expName }));
      }
    }

    // Create knowledge node
    const feature = parseSource(params.knowledgeSource, "knowledge.pattern");
    const key = `${r}/${params.knowledgeName}`;
    ctx.graph.addNode(key, "knowledge.pattern");
    ctx.graph.relateTo(r, key, "has-info");
    ctx.platform.writeContent(key, feature);

    // Consume insights — shadow them
    for (const expName of params.experienceNames) {
      ctx.graph.shadow(`${r}/${expName}`, false);
    }

    return `[${r}] ${t(l, "individual.reflect.done", { from: params.experienceNames.join(", "), to: params.knowledgeName })}\n\n${renderFeature(feature)}`;
  },
};

const contemplate: Process<
  { patternNames: string[]; theoryName: string; theorySource: string },
  Feature
> = {
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
      const key = `${r}/${pn}`;
      if (!ctx.graph.hasNode(key) || ctx.graph.getNode(key)!.shadow) {
        throw new Error(t(l, "error.patternNotFound", { name: pn }));
      }
    }

    // Create theory node
    const feature = parseSource(params.theorySource, "knowledge.theory");
    const key = `${r}/${params.theoryName}`;
    ctx.graph.addNode(key, "knowledge.theory");
    ctx.graph.relateTo(r, key, "has-info");
    ctx.platform.writeContent(key, feature);

    // Patterns are NOT consumed — theory is a view across patterns
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
      // Build tree view of the RoleX world using graph
      const roles: string[] = [];
      const orgs: string[] = [];

      // Find roles and orgs via society node
      if (ctx.graph.hasNode("society")) {
        const roleKeys = ctx.graph.neighbors("society", "has-role")
          .filter((k) => !ctx.graph.getNode(k)?.shadow);
        roles.push(...roleKeys);

        const orgKeys = ctx.graph.neighbors("society", "has-org")
          .filter((k) => !ctx.graph.getNode(k)?.shadow);
        orgs.push(...orgKeys);
      }

      // Merge built-in base roles (deduplicate)
      const baseRoles = ctx.base?.listRoles?.() ?? [];
      for (const br of baseRoles) {
        if (!roles.includes(br) && !orgs.includes(br)) {
          roles.push(br);
        }
      }

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
            const members = ctx.graph.neighbors(orgName, "member")
              .filter((k) => !ctx.graph.getNode(k)?.shadow);
            if (members.includes(name)) {
              const positions = ctx.graph.neighbors(name, "assigned")
                .filter((k) => !ctx.graph.getNode(k)?.shadow);
              context = positions.length > 0 ? ` → ${orgName}/${positions.join(", ")}` : ` → ${orgName}`;
              break;
            }
          }
          lines.push(`${prefix}${name}${context}`);
        }
      }

      return lines.join("\n");
    }

    // Detail view of a specific structure
    const baseRoleNames = ctx.base?.listRoles?.() ?? [];
    const isBaseRole = baseRoleNames.includes(params.name);
    if (!ctx.graph.hasNode(params.name) && !isBaseRole) {
      throw new Error(t(l, "error.roleNotFound", { name: params.name }));
    }

    const sections: string[] = [];
    sections.push(`[${r}] ${t(l, "individual.explore.detail", { name: params.name })}`);

    // Check if org (has type "organization")
    const nodeType = ctx.graph.getNode(params.name)?.type;
    if (nodeType === "organization") {
      const charterKey = `${params.name}/charter`;
      const charter = ctx.platform.readContent(charterKey);
      if (charter) sections.push(renderFeature(charter));

      const positions = activeOut(ctx, params.name, "has-position");
      if (positions.length > 0) {
        sections.push(`positions: ${positions.map((p) => p.split("/").pop()).join(", ")}`);
      }

      const members = ctx.graph.neighbors(params.name, "member")
        .filter((k) => !ctx.graph.getNode(k)?.shadow);
      if (members.length > 0) {
        sections.push(`members: ${members.join(", ")}`);
      }

      return sections.join("\n\n");
    }

    // Otherwise it's a role
    const infoKeys = activeOut(ctx, params.name, "has-info");
    const byType: Record<string, string[]> = {};
    for (const key of infoKeys) {
      const type = ctx.graph.getNode(key)!.type;
      if (!byType[type]) byType[type] = [];
      byType[type].push(key);
    }

    // Show persona
    const personaKeys = byType["persona"] || [];
    if (personaKeys.length > 0) {
      const personaFeatures = readContents(ctx, personaKeys);
      sections.push(renderFeatures(personaFeatures));
    }

    const patterns = byType["knowledge.pattern"] || [];
    const procedures = byType["knowledge.procedure"] || [];
    const theories = byType["knowledge.theory"] || [];
    const insights = byType["experience.insight"] || [];
    const activeGoals = activeOut(ctx, params.name, "has-goal");

    sections.push(
      t(l, "individual.explore.roleInfo", {
        patterns: patterns.length,
        procedures: procedures.length,
        theories: theories.length,
        insights: insights.length,
        goals: activeGoals.length,
      })
    );

    // Show org membership
    if (ctx.graph.hasNode("society")) {
      const orgKeys = ctx.graph.neighbors("society", "has-org")
        .filter((k) => !ctx.graph.getNode(k)?.shadow);
      const memberOf: string[] = [];
      for (const orgKey of orgKeys) {
        const members = ctx.graph.neighbors(orgKey, "member");
        if (members.includes(params.name)) memberOf.push(orgKey);
      }
      if (memberOf.length > 0) sections.push(`org: ${memberOf.join(", ")}`);
    }

    const positions = ctx.graph.neighbors(params.name, "assigned")
      .filter((k) => !ctx.graph.getNode(k)?.shadow);
    if (positions.length > 0) sections.push(`position: ${positions.join(", ")}`);

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
export function createIndividualSystem(
  graph: GraphModel,
  platform: Platform,
  rx?: ResourceX,
  base?: BaseProvider<Feature>
): RunnableSystem<Feature> {
  const processes: Record<string, Process<any, Feature>> = {
    identity,
    focus,
    explore,
    want,
    design,
    todo,
    finish,
    achieve,
    abandon,
    forget,
    reflect,
    contemplate,
    skill: createSkillProcess(rx),
  };

  if (rx) {
    processes.use = createUseProcess(rx);
  }

  return defineSystem(
    graph,
    platform,
    {
      name: "individual",
      description: "A single role's cognitive lifecycle — birth, learning, goal pursuit, growth.",
      processes,
    },
    base
  );
}
