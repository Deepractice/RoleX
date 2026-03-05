/**
 * Schema types for RoleX instruction definitions.
 *
 * These types define the structure of every RoleX operation:
 * parameter types, descriptions, and positional arg ordering.
 */

/** Supported parameter types for instruction definitions. */
export type ParamType = "string" | "number" | "gherkin" | "string[]" | "record";

/** Definition of a single parameter in an instruction. */
export interface ParamDef {
  type: ParamType;
  required: boolean;
  description: string;
}

/**
 * A single positional argument entry.
 *
 * - `string` — simple lookup: `args[name]`
 * - `{ pack: [...] }` — collect named args into an options object;
 *   returns `undefined` if all values are absent.
 */
export type ArgEntry = string | { pack: readonly string[] };

/** Full definition of a RoleX instruction (one namespace.method). */
export interface InstructionDef {
  namespace: string;
  method: string;
  /** Parameter definitions — keyed by param name, used for MCP/CLI schema generation. */
  params: Record<string, ParamDef>;
  /** Positional argument order — maps named args to method call positions. */
  args: readonly ArgEntry[];
}

/** RoleX tool definition — schema for a top-level tool (activate, want, use, etc.). */
export interface ToolDef {
  /** Tool name (e.g. "activate", "use"). */
  name: string;
  /** Parameter definitions — keyed by param name. */
  params: Record<string, ParamDef>;
  /** Whether the tool accepts additional unnamed parameters (e.g. use/direct). */
  additionalProperties?: boolean;
}
