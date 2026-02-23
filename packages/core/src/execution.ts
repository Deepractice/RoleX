/**
 * Execution cycle — the doing loop.
 *
 * want → plan → todo → finish → (encounter) → want → ...
 *                plan → complete → (encounter)
 *                plan → abandon  → (encounter)
 *
 * Goals are long-term directions. Plans are the completable unit —
 * they can be completed or abandoned. Tasks finish individually.
 * All transforms produce encounters — feeding the cognition cycle.
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
export const complete = process(
  "complete",
  "Complete a plan, record as encounter",
  plan,
  transform(plan, encounter)
);
export const abandon = process(
  "abandon",
  "Abandon a plan, record as encounter",
  plan,
  transform(plan, encounter)
);
