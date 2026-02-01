/**
 * @rolexjs/core
 * RoleX Core - AI Agent Role Management Framework
 *
 * RoleX is a DPML domain implementation for AI Agent Role resources.
 * It provides parsing, rendering, and ResourceX integration.
 */

// ========== Core API ==========

export { loadRole } from "./loader/index.js";

// BundledType for ResourceX integration (auto-generated)
export { roleType } from "./roleType.js";

// ========== Types ==========

export type {
  RenderedRole,
  ParsedThought,
  ParsedExecution,
  ThoughtSubTag,
  ExecutionSubTag,
  ResourceResolver,
} from "./types.js";

// ========== Errors ==========

export { RoleXError, RoleLoadError, ResourceResolveError, DPMLParseError } from "./errors.js";

// ========== Schema ==========

export type { RoleSchemas } from "./schema/index.js";
export {
  defineRoleSchemas,
  roleSchema,
  thoughtSchema,
  executionSchema,
  knowledgeSchema,
} from "./schema/index.js";

// ========== Transformer ==========

export type { RoleTransformer } from "./transformer/index.js";
export { roleTransformer } from "./transformer/index.js";

// ========== Resolver ==========

export { createResourceResolver } from "./resolver/index.js";

// ========== Version ==========

export const VERSION: string = "__VERSION__";
