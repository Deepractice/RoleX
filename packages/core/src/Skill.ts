/**
 * Skill — Execution capability for a task.
 *
 * Compatible with existing skill systems:
 * Claude Code skills, ResourceX resources, MCP tools, etc.
 */

/**
 * A capability that a role uses to execute a task.
 */
export interface Skill {
  /** Skill identifier, e.g. "commit", "bdd", "dev-flow" */
  readonly name: string;
  /** Reference to the concrete implementation: skill path, resource locator, tool URI */
  readonly reference: string;
}
