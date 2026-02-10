/**
 * render.ts — Presentation layer for RoleX output.
 *
 * Two-line status bar + next-step hints.
 * Used by MCP server and CLI for consistent output.
 */

import type { Platform } from "@rolexjs/core";
import { t } from "@rolexjs/core";

// ========== Status Bar ==========

interface RoleState {
  roleName: string;
  org: string;
  position: string;
  goal: string;
  hasPlan: boolean;
  tasksDone: number;
  tasksTotal: number;
  insightCount: number;
  patternCount: number;
}

/** Read current role state from platform. */
export function readRoleState(platform: Platform, roleName: string): RoleState {
  const focusList = platform.listRelations("focus", roleName);
  const goalName = focusList.length > 0 ? focusList[0] : null;

  let goal = "none";
  let hasPlan = false;
  if (goalName) {
    const g = platform.readInformation(roleName, "goal", goalName);
    const done = g?.tags?.some((tg: any) => tg.name === "@done" || tg.name === "@abandoned");
    goal = done ? "none" : goalName;

    if (goal !== "none") {
      const planNames = platform.listRelations(`has-plan.${goal}`, roleName);
      hasPlan = planNames.length > 0;
    }
  }

  let tasksDone = 0;
  let tasksTotal = 0;
  if (goal !== "none") {
    // Count tasks via focused plan relation
    const focusPlanList = platform.listRelations(`focus-plan.${goal}`, roleName);
    const focusPlanName = focusPlanList.length > 0 ? focusPlanList[0] : null;
    if (focusPlanName) {
      const taskNames = platform.listRelations(`has-task.${focusPlanName}`, roleName);
      for (const tn of taskNames) {
        const tk = platform.readInformation(roleName, "task", tn);
        if (tk) {
          tasksTotal++;
          if (tk.tags?.some((tag: any) => tag.name === "@done")) tasksDone++;
        }
      }
    }
  }

  // Count insights and patterns for growth hints
  const insights = platform.listInformation(roleName, "experience.insight");
  const patterns = platform.listInformation(roleName, "knowledge.pattern");
  const insightCount = insights.length;
  const patternCount = patterns.length;

  // Find org membership (scan structures for orgs that have this role)
  let org = "none";
  const allStructures = platform.listStructures();
  for (const s of allStructures) {
    const charter = platform.readInformation(s, "charter", "charter");
    if (charter && platform.hasRelation("membership", s, roleName)) {
      org = s;
      break;
    }
  }

  // Find position assignment (direct lookup)
  const positions = platform.listRelations("assignment", roleName);
  const position = positions.length > 0 ? positions.join(", ") : "none";

  return { roleName, org, position, goal, hasPlan, tasksDone, tasksTotal, insightCount, patternCount };
}

/** Render the two-line status bar. */
export function statusBar(state: RoleState, processName: string, locale: string, extra?: { taskName?: string }): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const line1Parts = [
    `[${state.roleName}]`,
  ];
  if (state.org !== "none") {
    line1Parts.push(t(locale, "render.org", { name: state.org }));
  }
  if (state.position !== "none") {
    line1Parts.push(t(locale, "render.position", { name: state.position }));
  }
  line1Parts.push(t(locale, "render.goal", { name: state.goal }));
  if (state.goal !== "none") {
    line1Parts.push(t(locale, "render.plan", { status: state.hasPlan ? "✓" : "✗" }));
    line1Parts.push(t(locale, "render.tasks", { done: state.tasksDone, total: state.tasksTotal }));
  }
  line1Parts.push(now);
  const line1 = line1Parts.join(" | ");
  const hint = nextHint(processName, state, locale, extra);
  const line2 = t(locale, "render.next", { hint });
  return `${line1}\n${line2}`;
}

// ========== Next Hints ==========

/** Compute the next-step hint for a given process. */
function nextHint(processName: string, state: RoleState, locale: string, extra?: { taskName?: string }): string {
  switch (processName) {
    case "identity": {
      let hint = state.goal === "none"
        ? t(locale, "render.hint.identity.noGoal")
        : t(locale, "render.hint.identity.hasGoal");
      // Growth hints — only when material exists, emphasize optional
      if (state.insightCount > 0) {
        hint += ` ${t(locale, "render.hint.identity.canReflect", { count: state.insightCount })}`;
      }
      if (state.patternCount >= 2) {
        hint += ` ${t(locale, "render.hint.identity.canContemplate", { count: state.patternCount })}`;
      }
      return hint;
    }

    case "focus":
      if (state.goal === "none") return t(locale, "render.hint.focus.noGoal");
      if (!state.hasPlan && state.tasksTotal === 0) return t(locale, "render.hint.focus.noPlanNoTask");
      if (state.tasksTotal === 0) return t(locale, "render.hint.focus.noTask");
      return t(locale, "render.hint.focus.hasTasks");

    case "want":
      return t(locale, "render.hint.want");

    case "design":
      return t(locale, "render.hint.design");

    case "todo":
      return extra?.taskName
        ? t(locale, "render.hint.todo", { name: extra.taskName })
        : t(locale, "render.hint.todo.generic");

    case "finish": {
      const remaining = state.tasksTotal - state.tasksDone;
      if (remaining === 0) return t(locale, "render.hint.finish.allDone");
      return t(locale, "render.hint.finish.remaining", { count: remaining });
    }

    case "achieve":
    case "abandon":
      return t(locale, "render.hint.achieveAbandon");

    case "forget":
      return t(locale, "render.hint.forget");

    case "reflect":
      return t(locale, "render.hint.reflect");

    case "contemplate":
      return t(locale, "render.hint.contemplate");


    case "explore":
      return t(locale, "render.hint.explore");

    case "skill":
      return t(locale, "render.hint.skill");

    case "use":
      return t(locale, "render.hint.use");

    default:
      return t(locale, "render.hint.default");
  }
}

/** Wrap process output with status bar. */
export function wrapOutput(
  platform: Platform,
  roleName: string,
  processName: string,
  result: string,
  extra?: { taskName?: string },
): string {
  const locale = (platform.readSettings?.()?.locale as string) ?? "en";
  const state = readRoleState(platform, roleName);
  const bar = statusBar(state, processName, locale, extra);
  return `${bar}\n\n${result}`;
}
