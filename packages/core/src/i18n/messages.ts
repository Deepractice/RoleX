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
  "individual.achieve.synthesized": "synthesized: {name}",
  "individual.achieve.consumed": "consumed {count} conclusion(s)",
  "individual.abandon.done": "abandoned: {name}",
  "individual.abandon.synthesized": "synthesized: {name}",
  "individual.abandon.consumed": "consumed {count} conclusion(s)",
  "individual.forget.done": "forgot {type}: {name}",
  "individual.reflect.done": "reflected: {from} → {to}",
  "individual.contemplate.done": "contemplated: {from} → {to}",
  "individual.skill.done": "skill loaded: {name}",
  "individual.explore.world": "roles: {roles} | organizations: {orgs}",
  "individual.explore.detail": "exploring: {name}",
  "individual.explore.roleInfo":
    "knowledge.pattern: {patterns} | knowledge.procedure: {procedures} | knowledge.theory: {theories} | experience.insight: {insights} | active goals: {goals}",
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
  "render.org": "org: {name}",
  "render.position": "position: {name}",
  "render.goal": "goal: {name}",
  "render.plan": "plan: {status}",
  "render.tasks": "tasks: {done}/{total}",
  "render.next": "I → {hint}",

  // --- Render (hints) — self-directed cognitive cues for the AI role, NOT user-facing advice ---
  "render.hint.identity.noGoal":
    "I have no goal yet. I should call `want` to declare one, or `focus` to review existing goals.",
  "render.hint.identity.hasGoal":
    "I have an active goal. I should call `focus` to review progress, or `want` to declare a new goal.",
  "render.hint.identity.canReflect":
    "I have {count} insight(s) — I can call `reflect` when I see a pattern across them.",
  "render.hint.identity.canContemplate":
    "I have {count} pattern(s) — I can call `contemplate` when I see a unifying theory.",
  "render.hint.focus.noGoal": "I have no goal. I should call `want` to declare one.",
  "render.hint.focus.noPlanNoTask":
    "I have a goal but no plan or tasks. I should call `design` or `todo`.",
  "render.hint.focus.noTask":
    "I have a plan but no tasks. I should call `todo` to create concrete tasks.",
  "render.hint.focus.hasTasks":
    "I have tasks in progress. I should continue working, call `todo` to add more, or `achieve` when the goal is met.",
  "render.hint.want": "Goal declared. I should call `design` to plan, or `todo` to create tasks.",
  "render.hint.design": "Plan created. I should call `todo` to create tasks, or start working.",
  "render.hint.todo":
    'Task created. I can call `todo` for more, or `finish("{name}")` when this one is done.',
  "render.hint.todo.generic": "Task created. I can call `todo` for more, or `finish` when done.",
  "render.hint.finish.allDone": "All tasks done. I should call `achieve` to complete the goal.",
  "render.hint.finish.remaining": "{count} task(s) remaining. I should `finish` the next one.",
  "render.hint.achieveAbandon":
    "Goal closed. I can call `want` for a new goal, or `focus` to review others.",
  "render.hint.forget": "Information removed. I can call `identity` to verify.",
  "render.hint.finish.withConclusion": "Conclusion recorded. {count} task(s) remaining.",
  "render.hint.reflect": "Knowledge produced. I can call `identity` to see my updated knowledge.",
  "render.hint.contemplate": "Theory produced. I can call `identity` to see my updated theory.",
  "render.hint.skill": "Skill loaded into my context. I should follow the described workflow.",
  "render.hint.use": "Tool executed. I should continue with my task.",
  "render.hint.explore": "I can call `explore` with a name for details, or continue working.",
  "render.hint.default": "I should continue working.",

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
  "individual.achieve.synthesized": "已蒸馏: {name}",
  "individual.achieve.consumed": "已消费 {count} 个经历",
  "individual.abandon.done": "已放弃: {name}",
  "individual.abandon.synthesized": "已蒸馏: {name}",
  "individual.abandon.consumed": "已消费 {count} 个经历",
  "individual.forget.done": "已忘记 {type}: {name}",
  "individual.reflect.done": "已反思: {from} → {to}",
  "individual.contemplate.done": "已沉思: {from} → {to}",
  "individual.skill.done": "技能已加载: {name}",
  "individual.explore.world": "角色: {roles} | 组织: {orgs}",
  "individual.explore.detail": "探索: {name}",
  "individual.explore.roleInfo":
    "知识模式: {patterns} | 知识程序: {procedures} | 知识理论: {theories} | 经验洞察: {insights} | 活跃目标: {goals}",
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
  "render.org": "组织: {name}",
  "render.position": "职位: {name}",
  "render.goal": "目标: {name}",
  "render.plan": "计划: {status}",
  "render.tasks": "任务: {done}/{total}",
  "render.next": "我 → {hint}",

  // --- Render (hints) — AI 角色的自我认知提示，不是给用户的操作指引 ---
  "render.hint.identity.noGoal":
    "我还没有目标。我应该调用 `want` 声明一个，或 `focus` 查看已有目标。",
  "render.hint.identity.hasGoal":
    "我有活跃目标。我应该调用 `focus` 查看进展，或 `want` 声明新目标。",
  "render.hint.identity.canReflect":
    "我有 {count} 条洞察 — 当我发现其中的规律时，可以调用 `reflect` 提炼为知识。",
  "render.hint.identity.canContemplate":
    "我有 {count} 个模式 — 当我发现统一的理论时，可以调用 `contemplate` 升华。",
  "render.hint.focus.noGoal": "我没有目标。我应该调用 `want` 声明一个。",
  "render.hint.focus.noPlanNoTask": "我有目标但没有计划和任务。我应该调用 `design` 或 `todo`。",
  "render.hint.focus.noTask": "我有计划但没有任务。我应该调用 `todo` 创建具体任务。",
  "render.hint.focus.hasTasks":
    "我有进行中的任务。我应该继续工作，调用 `todo` 添加更多，或 `achieve` 完成目标。",
  "render.hint.want": "目标已声明。我应该调用 `design` 制定计划，或 `todo` 创建任务。",
  "render.hint.design": "计划已创建。我应该调用 `todo` 创建任务，或开始工作。",
  "render.hint.todo":
    '任务已创建。我可以调用 `todo` 添加更多，或 `finish("{name}")` 完成当前任务。',
  "render.hint.todo.generic": "任务已创建。我可以调用 `todo` 添加更多，或 `finish` 完成任务。",
  "render.hint.finish.allDone": "所有任务已完成。我应该调用 `achieve` 完成目标。",
  "render.hint.finish.remaining": "剩余 {count} 个任务。我应该 `finish` 下一个。",
  "render.hint.achieveAbandon":
    "目标已关闭。我可以调用 `want` 声明新目标，或 `focus` 查看其他目标。",
  "render.hint.forget": "信息已移除。我可以调用 `identity` 确认。",
  "render.hint.finish.withConclusion": "总结已记录。剩余 {count} 个任务。",
  "render.hint.reflect": "知识已产出。我可以调用 `identity` 查看更新的知识。",
  "render.hint.contemplate": "理论已产出。我可以调用 `identity` 查看更新的理论。",
  "render.hint.skill": "技能已加载到我的上下文中。我应该按描述的工作流执行。",
  "render.hint.use": "工具已执行。我应该继续我的任务。",
  "render.hint.explore": "我可以调用 `explore` 加名字查看详情，或继续工作。",
  "render.hint.default": "我应该继续工作。",

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
