/**
 * Individual — the structure tree and processes for an agent identity.
 *
 * Structure tree:
 *
 * society
 * ├── individual
 * │   ├── persona        — who I am
 * │   ├── voice          — how I communicate
 * │   ├── memoir         — my personal history
 * │   ├── philosophy     — how I think
 * │   ├── knowledge      — what I know
 * │   │   ├── pattern       — transferable principles
 * │   │   ├── procedure     — skills and workflows
 * │   │   └── theory        — unified principles
 * │   ├── experience     — what I learned from goals
 * │   │   ├── insight       — transferable learning (temporary)
 * │   │   └── conclusion    — completion summaries (permanent)
 * │   └── goal           — what I am pursuing
 * │       └── plan
 * │           └── task
 * └── organization
 *
 * Processes (14 individual system):
 *
 *   Read:      identity, focus, explore, skill, use
 *   Create:    want, design, todo
 *   Remove:    forget
 *   Transform: finish, achieve, abandon, reflect, contemplate
 */
import { structure, create, remove, transform, process } from "@rolexjs/system";

// ================================================================
//  Structure tree
// ================================================================

// ===== Root =====

export const society = structure("society", "The RoleX world", null);

// ===== Level 1 =====

export const individual = structure("individual", "An agent identity", society);
export const organization = structure("organization", "A group of roles", society);

// ===== Individual — Identity =====

export const persona = structure("persona", "Who I am", individual);
export const voice = structure("voice", "How I communicate", individual);
export const memoir = structure("memoir", "My personal history", individual);

// ===== Individual — Thinking =====

export const philosophy = structure("philosophy", "How I think", individual);

// ===== Individual — Knowledge =====

export const knowledge = structure("knowledge", "What I know", individual);
export const pattern = structure("pattern", "Transferable principles", knowledge);
export const procedure = structure("procedure", "Skills and workflows", knowledge);
export const theory = structure("theory", "Unified principles", knowledge);

// ===== Individual — Experience =====

export const experience = structure("experience", "What I learned from goals", individual);
export const insight = structure("insight", "Transferable learning", experience);
export const conclusion = structure("conclusion", "Completion summaries", experience);

// ===== Individual — Execution =====

export const goal = structure("goal", "A desired outcome", individual);
export const plan = structure("plan", "How to achieve a goal", goal);
export const task = structure("task", "Concrete unit of work", plan);

// ================================================================
//  Processes (14 individual system)
// ================================================================

// ===== Read (projection only, no tree ops) =====

export const identity = process("identity", "Project the individual's full identity", individual);
export const focus = process("focus", "Project the current goal focus", goal);
export const explore = process("explore", "Discover roles and organizations", society);
export const skill = process("skill", "Load full skill instructions", procedure);
export const use = process("use", "Execute an external tool", individual);

// ===== Create =====

export const want = process("want", "Declare a goal", individual, create(goal));
export const design = process("design", "Create a plan for a goal", goal, create(plan));
export const todo = process("todo", "Create a task in a plan", plan, create(task));

// ===== Remove =====

export const forget = process("forget", "Remove knowledge or insight from identity", individual,
  remove(pattern), remove(procedure), remove(theory), remove(insight));

// ===== Transform =====

export const finish = process("finish", "Complete a task", task, transform(task, conclusion));
export const achieve = process("achieve", "Complete a goal, distill experience", goal, transform(goal, conclusion), transform(goal, insight));
export const abandon = process("abandon", "Abandon a goal", goal, transform(goal, conclusion), transform(goal, insight));
export const reflect = process("reflect", "Distill insights into knowledge", experience, transform(insight, pattern));
export const contemplate = process("contemplate", "Unify patterns into theory", knowledge, transform(pattern, theory));
