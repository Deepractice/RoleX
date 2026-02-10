/**
 * i18n messages — all user-facing text in RoleX.
 *
 * Two locales: en (default) and zh.
 * Keys are namespaced: individual.*, role.*, org.*, governance.*, render.*, error.*
 */

export type Locale = "en" | "zh";

// ========== Messages Type ==========

type Messages = Record<string, string>;

// ========== English ==========

const en: Messages = {
  // --- Individual System ---
  "individual.identity.loaded": "identity loaded",
  "individual.focus.noGoal": "goal: none",
  "individual.focus.noGoalInactive": "goal: none (focused goal not active)",
  "individual.focus.goal": "goal: {name}",
  "individual.focus.plans": "Plans (focused: {name}):",
  "individual.focus.plansNone": "Plans: none",
  "individual.focus.tasks": "Tasks (plan: {name}):",
  "individual.focus.tasksNone": "Tasks: none",
  "individual.focus.otherGoals": "Other goals: {names}",
  "individual.want.created": "want: {name}",
  "individual.design.created": "plan: {name} (for {goal})",
  "individual.todo.created": "todo: {name} (plan: {plan})",
  "individual.finish.done": "finished: {name}",
  "individual.finish.conclusion": "conclusion: {name}",
  "individual.achieve.done": "achieved: {name}",
  "individual.achieve.conclusion": "conclusion: {name}",
  "individual.achieve.synthesized": "synthesized: {name}",
  "individual.abandon.done": "abandoned: {name}",
  "individual.abandon.conclusion": "conclusion: {name}",
  "individual.abandon.synthesized": "synthesized: {name}",
  "individual.forget.done": "forgot {type}: {name}",
  "individual.reflect.done": "reflected: {from} → {to}",
  "individual.contemplate.done": "contemplated: {from} → {to}",
  "individual.skill.done": "skill loaded: {name}",
  "individual.use.done": "used: {name}",

  // --- Role System ---
  "role.born": "born",
  "role.taught": "taught: {name}",
  "role.trained": "trained: {name}",
  "role.retired": "retired",
  "role.killed": "killed",

  // --- Org System ---
  "org.founded": "founded",
  "org.dissolved": "dissolved",

  // --- Governance System ---
  "governance.charter": "charter: {name}",
  "governance.established": "established: {name}",
  "governance.abolished": "abolished: {name}",
  "governance.duty": "duty: {name}",
  "governance.hired": "hired: {name}",
  "governance.fired": "fired: {name}",
  "governance.appointed": "appointed to: {name}",
  "governance.dismissed": "dismissed from: {name}",
  "governance.directory": "directory",
  "governance.members": "Members:",
  "governance.membersNone": "Members: none",
  "governance.positions": "Positions:",
  "governance.positionsNone": "Positions: none",

  // --- Render (status bar) ---
  "render.goal": "goal: {name}",
  "render.plan": "plan: {status}",
  "render.tasks": "tasks: {done}/{total}",
  "render.next": "Next: {hint}",

  // --- Render (hints) ---
  "render.hint.identity.noGoal": "`want` to set a goal, or `focus` to check existing goals.",
  "render.hint.identity.hasGoal": "`focus` to check current goal, or `want` to set a new goal.",
  "render.hint.focus.noGoal": "`want` to set a new goal.",
  "render.hint.focus.noPlanNoTask": "`design` to create a plan, or `todo` to create tasks.",
  "render.hint.focus.noTask": "`todo` to break the plan into concrete tasks.",
  "render.hint.focus.hasTasks": "Continue with next task, `todo` to add more, or `achieve` when goal is met.",
  "render.hint.want": "`design` to create a plan, or `todo` to create tasks directly.",
  "render.hint.design": "`todo` to create tasks, or start working directly.",
  "render.hint.todo": "`todo` to add more tasks, or `finish(\"{name}\")` when done.",
  "render.hint.todo.generic": "`todo` to add more tasks, or `finish` when done.",
  "render.hint.finish.allDone": "All tasks done! `achieve` to complete the goal, or `todo` to add more.",
  "render.hint.finish.remaining": "{count} task(s) remaining. `finish` next task, or `todo` to add more.",
  "render.hint.achieveAbandon": "`want` to set a new goal, or `focus` to check other goals.",
  "render.hint.forget": "`identity` to verify, or continue working.",
  "render.hint.finish.withConclusion": "Conclusion recorded. {count} task(s) remaining.",
  "render.hint.reflect": "`identity` to see updated knowledge, or `contemplate` to unify patterns into theory.",
  "render.hint.contemplate": "`identity` to see updated theory, or continue working.",
  "render.hint.skill": "Skill loaded. Execute using the described workflow.",
  "render.hint.use": "Tool executed. Continue with your task.",
  "render.hint.default": "Continue working.",

  // --- Errors ---
  "error.noRole": "No role activated. Call identity first.",
  "error.noGoal": "No active goal. Call want first.",
  "error.noPlan": "No plan for current goal. Call design first.",
  "error.taskNotFound": "Task not found: {name}",
  "error.goalNotFound": "Goal not found: {name}",
  "error.roleNotFound": "Role not found: {name}",
  "error.experienceRequired": "At least one experience required",
  "error.experienceNotFound": "Experience not found: {name}",
  "error.patternRequired": "At least one pattern required",
  "error.patternNotFound": "Pattern not found: {name}",
  "error.procedureNotFound": "Procedure not found: {name}",
  "error.informationNotFound": "{type} not found: {name}",
};

// ========== Chinese ==========

const zh: Messages = {
  // --- Individual System ---
  "individual.identity.loaded": "身份已加载",
  "individual.focus.noGoal": "目标: 无",
  "individual.focus.noGoalInactive": "目标: 无 (聚焦目标不活跃)",
  "individual.focus.goal": "目标: {name}",
  "individual.focus.plans": "计划 (聚焦: {name}):",
  "individual.focus.plansNone": "计划: 无",
  "individual.focus.tasks": "任务 (计划: {name}):",
  "individual.focus.tasksNone": "任务: 无",
  "individual.focus.otherGoals": "其他目标: {names}",
  "individual.want.created": "目标: {name}",
  "individual.design.created": "计划: {name} (目标: {goal})",
  "individual.todo.created": "待办: {name} (计划: {plan})",
  "individual.finish.done": "已完成: {name}",
  "individual.finish.conclusion": "总结: {name}",
  "individual.achieve.done": "已达成: {name}",
  "individual.achieve.conclusion": "总结: {name}",
  "individual.achieve.synthesized": "已蒸馏: {name}",
  "individual.abandon.done": "已放弃: {name}",
  "individual.abandon.conclusion": "总结: {name}",
  "individual.abandon.synthesized": "已蒸馏: {name}",
  "individual.forget.done": "已忘记 {type}: {name}",
  "individual.reflect.done": "已反思: {from} → {to}",
  "individual.contemplate.done": "已沉思: {from} → {to}",
  "individual.skill.done": "技能已加载: {name}",
  "individual.use.done": "已使用: {name}",

  // --- Role System ---
  "role.born": "已诞生",
  "role.taught": "已教授: {name}",
  "role.trained": "已训练: {name}",
  "role.retired": "已退休",
  "role.killed": "已销毁",

  // --- Org System ---
  "org.founded": "已创立",
  "org.dissolved": "已解散",

  // --- Governance System ---
  "governance.charter": "章程: {name}",
  "governance.established": "已设立: {name}",
  "governance.abolished": "已废除: {name}",
  "governance.duty": "职责: {name}",
  "governance.hired": "已招聘: {name}",
  "governance.fired": "已解雇: {name}",
  "governance.appointed": "已任命至: {name}",
  "governance.dismissed": "已免除: {name}",
  "governance.directory": "通讯录",
  "governance.members": "成员:",
  "governance.membersNone": "成员: 无",
  "governance.positions": "职位:",
  "governance.positionsNone": "职位: 无",

  // --- Render (status bar) ---
  "render.goal": "目标: {name}",
  "render.plan": "计划: {status}",
  "render.tasks": "任务: {done}/{total}",
  "render.next": "下一步: {hint}",

  // --- Render (hints) ---
  "render.hint.identity.noGoal": "`want` 设定目标，或 `focus` 查看已有目标。",
  "render.hint.identity.hasGoal": "`focus` 查看当前目标，或 `want` 设定新目标。",
  "render.hint.focus.noGoal": "`want` 设定新目标。",
  "render.hint.focus.noPlanNoTask": "`design` 制定计划，或 `todo` 创建任务。",
  "render.hint.focus.noTask": "`todo` 将计划拆解为具体任务。",
  "render.hint.focus.hasTasks": "继续执行任务，`todo` 添加更多，或 `achieve` 完成目标。",
  "render.hint.want": "`design` 制定计划，或 `todo` 直接创建任务。",
  "render.hint.design": "`todo` 创建任务，或直接开始工作。",
  "render.hint.todo": "`todo` 添加更多任务，或 `finish(\"{name}\")` 完成当前任务。",
  "render.hint.todo.generic": "`todo` 添加更多任务，或 `finish` 完成任务。",
  "render.hint.finish.allDone": "所有任务已完成！`achieve` 完成目标，或 `todo` 添加更多。",
  "render.hint.finish.remaining": "剩余 {count} 个任务。`finish` 下一个，或 `todo` 添加更多。",
  "render.hint.achieveAbandon": "`want` 设定新目标，或 `focus` 查看其他目标。",
  "render.hint.forget": "`identity` 确认变更，或继续工作。",
  "render.hint.finish.withConclusion": "已记录总结。剩余 {count} 个任务。",
  "render.hint.reflect": "`identity` 查看更新的知识，或 `contemplate` 将模式统一为理论。",
  "render.hint.contemplate": "`identity` 查看更新的理论，或继续工作。",
  "render.hint.skill": "技能已加载。按描述的工作流执行。",
  "render.hint.use": "工具已执行。继续你的任务。",
  "render.hint.default": "继续工作。",

  // --- Errors ---
  "error.noRole": "未激活角色。请先调用 identity。",
  "error.noGoal": "没有活跃目标。请先调用 want。",
  "error.noPlan": "当前目标没有计划。请先调用 design。",
  "error.taskNotFound": "任务未找到: {name}",
  "error.goalNotFound": "目标未找到: {name}",
  "error.roleNotFound": "角色未找到: {name}",
  "error.experienceRequired": "至少需要一条经验",
  "error.experienceNotFound": "经验未找到: {name}",
  "error.patternRequired": "至少需要一个模式",
  "error.patternNotFound": "模式未找到: {name}",
  "error.procedureNotFound": "技能未找到: {name}",
  "error.informationNotFound": "{type} 未找到: {name}",
};

// ========== Lookup ==========

export type MessageKey = string;

const messages: Record<Locale, Messages> = { en, zh };

/** Translate a message key with optional parameter substitution. */
export function t(locale: string, key: string, params?: Record<string, string | number>): string {
  const loc = (locale in messages ? locale : "en") as Locale;
  let msg = messages[loc][key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replaceAll(`{${k}}`, String(v));
    }
  }
  return msg;
}
