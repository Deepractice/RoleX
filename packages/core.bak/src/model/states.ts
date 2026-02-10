/**
 * states.ts — Role and Position state definitions.
 *
 * Role:     free → member → on_duty
 * Position: vacant → filled
 */

export type RoleState = "free" | "member" | "on_duty";
export type PositionState = "vacant" | "filled";

/**
 * Derive a role's state from assignment data.
 */
export function getRoleState(assignment: { org: string; position?: string } | null): RoleState {
  if (!assignment) return "free";
  if (assignment.position) return "on_duty";
  return "member";
}

/**
 * Derive a position's state from assignment data.
 */
export function getPositionState(assignedRole: string | null): PositionState {
  return assignedRole ? "filled" : "vacant";
}
