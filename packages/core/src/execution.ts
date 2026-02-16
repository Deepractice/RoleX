/**
 * Execution cycle — the doing loop.
 *
 * want → plan → todo → finish → (encounter) → want → ...
 *                       achieve → (encounter)
 *                       abandon → (encounter)
 *
 * This cycle drives goal pursuit. When tasks finish or goals
 * complete, they transform into encounters — feeding the
 * cognition cycle.
 */
import { create, process, transform } from "@rolexjs/system";
import { encounter, goal, individual, plan, task } from "./structures.js";

export const want = process("want", "Declare a goal", individual, create(goal));
export const planGoal = process("plan", "Create a plan for a goal", goal, create(plan));
export const todo = process("todo", "Create a task in a plan", plan, create(task));

export const finish = process(
  "finish",
  "Complete a task, record as encounter",
  task,
  transform(task, encounter)
);
export const achieve = process(
  "achieve",
  "Complete a goal, record as encounter",
  goal,
  transform(goal, encounter)
);
export const abandon = process(
  "abandon",
  "Abandon a goal, record as encounter",
  goal,
  transform(goal, encounter)
);
