/**
 * Transformer Types
 * @rolexjs/core
 */

import type { RenderedRole } from "~/types.js";

/**
 * Transformer input interface (compatible with dpml 0.3.0)
 */
export interface TransformInput {
  document: {
    rootNode: unknown;
    nodesById?: Map<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  isValid?: boolean;
  validation?: { isValid: boolean; errors: unknown[]; warnings: unknown[] };
  resources?: unknown[];
}

/**
 * Role transformer type
 */
export interface RoleTransformer {
  name: string;
  description?: string;
  transform(input: TransformInput): RenderedRole;
}
