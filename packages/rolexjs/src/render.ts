/**
 * render.ts — Presentation layer for RoleX output.
 *
 * Two-line status bar + next-step hints.
 * Used by MCP server and CLI for consistent output.
 */

import type { Platform } from "@rolexjs/core";

// ========== Status Bar ==========

interface RoleState {
  roleName: string;
  goal: string;
  hasPlan: boolean;
  tasksDone: number;
  tasksTotal: number;
}

/** Read current role state from platform. */
export function readRoleState(platform: Platform, roleName: string): RoleState {
  const focusList = platform.listRelations("focus", roleName);
  const goalName = focusList.length > 0 ? focusList[0] : null;

  let goal = "none";
  let hasPlan = false;
  if (goalName) {
    const g = platform.readInformation(roleName, "goal", goalName);
    const done = g?.tags?.some((t: any) => t.name === "@done" || t.name === "@abandoned");
    goal = done ? "none" : goalName;

    if (goal !== "none") {
      const plan = platform.readInformation(roleName, "plan", goalName);
      hasPlan = plan !== null;
    }
  }

  const tasks = platform.listInformation(roleName, "task");
  const tasksDone = tasks.filter((t) => t.tags?.some((tag: any) => tag.name === "@done")).length;

  return { roleName, goal, hasPlan, tasksDone, tasksTotal: tasks.length };
}

/** Render the two-line status bar. */
export function statusBar(state: RoleState, processName: string, extra?: { taskName?: string }): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const plan = state.goal === "none" ? "✗" : state.hasPlan ? "✓" : "✗";
  const line1Parts = [
    `[${state.roleName}]`,
    `goal: ${state.goal}`,
    `plan: ${plan}`,
    `tasks: ${state.tasksDone}/${state.tasksTotal}`,
    now,
  ];
  const line1 = line1Parts.join(" | ");
  const line2 = `Next: ${nextHint(processName, state, extra)}`;
  return `${line1}\n${line2}`;
}

// ========== Next Hints ==========

/** Compute the next-step hint for a given process. */
function nextHint(processName: string, state: RoleState, extra?: { taskName?: string }): string {
  switch (processName) {
    case "identity":
      return state.goal === "none"
        ? "`want` to set a goal, or `focus` to check existing goals."
        : "`focus` to check current goal.";

    case "focus":
      if (state.goal === "none") return "`want` to set a new goal.";
      if (!state.hasPlan && state.tasksTotal === 0) return "`design` to create a plan, or `todo` to create tasks.";
      if (state.tasksTotal === 0) return "`todo` to break the plan into concrete tasks.";
      return "Continue with next task, or `todo` to add more tasks.";

    case "want":
      return "`design` to create a plan, or `todo` to create tasks directly.";

    case "design":
      return "`todo` to break the plan into concrete tasks.";

    case "todo":
      return extra?.taskName
        ? `Execute the task, then \`finish("${extra.taskName}")\` when done.`
        : "Execute the task, then `finish` when done.";

    case "finish": {
      const remaining = state.tasksTotal - state.tasksDone;
      if (remaining === 0) return "All tasks done! `achieve` to complete the goal.";
      return `${remaining} task(s) remaining.`;
    }

    case "achieve":
    case "abandon":
      return "`want` to set a new goal, or `focus` to check other goals.";

    case "synthesize":
      return "Continue working. When patterns emerge, `reflect` to distill into knowledge.";

    case "reflect":
      return "`identity` to see updated knowledge.";

    case "apply":
      return "Procedure loaded. Execute using the described workflow.";

    case "use":
      return "Tool executed. Continue with your task.";

    default:
      return "Continue working.";
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
  const state = readRoleState(platform, roleName);
  const bar = statusBar(state, processName, extra);
  return `${bar}\n\n${result}`;
}
