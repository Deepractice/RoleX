/**
 * RoleX Core Types
 * @rolexjs/core
 */

/**
 * Rendered Role object
 */
export interface RenderedRole {
  /** Final rendered complete prompt */
  readonly prompt: string;
  /** Personality section */
  readonly personality: string;
  /** Principle section */
  readonly principle: string;
  /** Knowledge section */
  readonly knowledge: string;
}

/**
 * Thought sub-tag types
 */
export type ThoughtSubTag = "exploration" | "reasoning" | "challenge" | "plan";

/**
 * Execution sub-tag types
 */
export type ExecutionSubTag = "process" | "constraint" | "rule" | "guideline" | "criteria";

/**
 * Parsed Thought content
 */
export interface ParsedThought {
  readonly exploration?: string;
  readonly reasoning?: string;
  readonly challenge?: string;
  readonly plan?: string;
}

/**
 * Parsed Execution content
 */
export interface ParsedExecution {
  readonly process?: string;
  readonly constraint?: string;
  readonly rule?: string;
  readonly guideline?: string;
  readonly criteria?: string;
}

/**
 * Resource resolver function type
 */
export type ResourceResolver = (src: string) => Promise<string>;
