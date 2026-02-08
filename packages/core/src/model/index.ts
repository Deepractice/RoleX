/**
 * model/ — State machines, transitions, and relationship constraints.
 */

export type { RoleState, PositionState } from "./states.js";
export { getRoleState, getPositionState } from "./states.js";

export type { Transition } from "./transitions.js";
export {
  ROLE_MACHINE,
  POSITION_MACHINE,
  findTransition,
  canTransition,
  transition,
} from "./transitions.js";

export type { OneToOneConstraint } from "./relations.js";
export { RELATIONS, validateOneToOne } from "./relations.js";
