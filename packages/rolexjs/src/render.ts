/**
 * render.ts — Presentation layer for RoleX output.
 *
 * Two-line status bar + next-step hints.
 * Used by MCP server and CLI for consistent output.
 *
 * Now uses GraphModel for topology queries and Platform for content/settings.
 */

import type { Platform, GraphModel } from "@rolexjs/core";
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

/** Helper: get active (non-shadowed) outbound neighbors by edge type. */
function activeOut(graph: GraphModel, key: string, edgeType: string): string[] {
  return graph
    .outNeighbors(key, edgeType)
    .filter((k) => {
      const node = graph.getNode(k);
      return node && !node.shadow;
    });
}

/** Read current role state from graph + platform. */
export function readRoleState(graph: GraphModel, _platform: Platform, roleName: string): RoleState {
  // Focus goal from role node state
  const roleNode = graph.getNode(roleName);
  const focusGoalKey = roleNode?.state?.focus as string | undefined;

  let goal = "none";
  let hasPlan = false;
  if (focusGoalKey) {
    const goalNode = graph.getNode(focusGoalKey);
    if (goalNode && !goalNode.shadow) {
      goal = focusGoalKey.split("/").pop() || focusGoalKey;
    }
  }

  let tasksDone = 0;
  let tasksTotal = 0;
  if (goal !== "none" && focusGoalKey) {
    // Find focused plan from goal node state
    const goalNode = graph.getNode(focusGoalKey);
    const focusPlanKey = goalNode?.state?.focusPlan as string | undefined;

    if (focusPlanKey) {
      // Count tasks under this plan
      const tasks = activeOut(graph, focusPlanKey, "has-task");
      for (const taskKey of tasks) {
        tasksTotal++;
        const taskNode = graph.getNode(taskKey);
        if (taskNode?.state?.done) tasksDone++;
      }
    }

    // Check if any plan exists
    const plans = activeOut(graph, focusGoalKey, "has-plan");
    hasPlan = plans.length > 0;
  }

  // Count insights and patterns for growth hints
  const insights = activeOut(graph, roleName, "has-info")
    .filter((k) => graph.getNode(k)?.type === "experience.insight");
  const patterns = activeOut(graph, roleName, "has-info")
    .filter((k) => graph.getNode(k)?.type === "knowledge.pattern");
  const insightCount = insights.length;
  const patternCount = patterns.length;

  // Find org membership (undirected "member" edge)
  let org = "none";
  const memberOrgs = graph.neighbors(roleName, "member")
    .filter((k) => {
      const node = graph.getNode(k);
      return node && node.type === "organization" && !node.shadow;
    });
  if (memberOrgs.length > 0) org = memberOrgs[0];

  // Find position assignments (undirected "assigned" edge)
  const positions = graph.neighbors(roleName, "assigned")
    .filter((k) => {
      const node = graph.getNode(k);
      return node && node.type === "position" && !node.shadow;
    });
  const position = positions.length > 0 ? positions.join(", ") : "none";

  return {
    roleName,
    org,
    position,
    goal,
    hasPlan,
    tasksDone,
    tasksTotal,
    insightCount,
    patternCount,
  };
}

/** Render the two-line status bar. */
export function statusBar(
  state: RoleState,
  processName: string,
  locale: string,
  extra?: { taskName?: string }
): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const line1Parts = [`[${state.roleName}]`];
  if (state.org !== "none") {
    line1Parts.push(t(locale, "render.org", { name: state.org }));
  }
  if (state.position !== "none") {
    line1Parts.push(t(locale, "render.position", { name: state.position }));
  }
  line1Parts.push(t(locale, "render.goal", { name: state.goal }));
  if (state.goal !== "none") {
    line1Parts.push(t(locale, "render.plan", { status: state.hasPlan ? "\u2713" : "\u2717" }));
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
function nextHint(
  processName: string,
  state: RoleState,
  locale: string,
  extra?: { taskName?: string }
): string {
  switch (processName) {
    case "identity": {
      let hint =
        state.goal === "none"
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
      if (!state.hasPlan && state.tasksTotal === 0)
        return t(locale, "render.hint.focus.noPlanNoTask");
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
  graph: GraphModel,
  platform: Platform,
  roleName: string,
  processName: string,
  result: string,
  extra?: { taskName?: string }
): string {
  const locale = (platform.readSettings?.()?.locale as string) ?? "en";
  const state = readRoleState(graph, platform, roleName);
  const bar = statusBar(state, processName, locale, extra);
  return `${bar}\n\n${result}`;
}
