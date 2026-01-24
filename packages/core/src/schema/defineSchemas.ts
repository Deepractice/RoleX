/**
 * Define DPML Schemas for Role
 * @rolexjs/core
 */

import { defineSchema, type Schema } from "dpml";
import type { RoleSchemas } from "./types.js";

/**
 * Create all RoleX schemas
 *
 * Role structure:
 * <role>
 *   <personality>...</personality>
 *   <principle>...</principle>
 *   <knowledge>...</knowledge>
 * </role>
 */
export function defineRoleSchemas(): RoleSchemas {
  const role = defineSchema({
    element: "role",
    children: {
      elements: [{ element: "personality" }, { element: "principle" }, { element: "knowledge" }],
    },
  });

  const thought = defineSchema({
    element: "thought",
    children: {
      elements: [
        { element: "exploration" },
        { element: "reasoning" },
        { element: "challenge" },
        { element: "plan" },
      ],
    },
  });

  const execution = defineSchema({
    element: "execution",
    children: {
      elements: [
        { element: "process" },
        { element: "constraint" },
        { element: "rule" },
        { element: "guideline" },
        { element: "criteria" },
      ],
    },
  });

  const knowledge = defineSchema({
    element: "knowledge",
    content: { type: "text" },
  });

  return { role, thought, execution, knowledge };
}

// Default schemas instance
const schemas: RoleSchemas = defineRoleSchemas();

export const roleSchema: Schema = schemas.role;
export const thoughtSchema: Schema = schemas.thought;
export const executionSchema: Schema = schemas.execution;
export const knowledgeSchema: Schema = schemas.knowledge;
