/**
 * relations.ts — One-to-one relationship constraints.
 *
 * - A role can belong to at most one organization
 * - A role can hold at most one position
 * - A position can be held by at most one role
 */

export interface OneToOneConstraint {
  readonly entity: string;
  readonly relation: string;
  readonly description: string;
}

export const RELATIONS: OneToOneConstraint[] = [
  {
    entity: "role",
    relation: "organization",
    description: "A role can belong to at most one organization",
  },
  { entity: "role", relation: "position", description: "A role can hold at most one position" },
  {
    entity: "position",
    relation: "role",
    description: "A position can be held by at most one role",
  },
];

/**
 * Validate that a one-to-one assignment does not conflict.
 * Throws if the entity is already assigned.
 */
export function validateOneToOne(
  entityName: string,
  currentValue: string | null,
  newValue: string,
  constraintDesc: string
): void {
  if (currentValue && currentValue !== newValue) {
    throw new Error(`${constraintDesc}: "${entityName}" is already assigned to "${currentValue}"`);
  }
}
