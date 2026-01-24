/**
 * Role Transformer
 * Transform DPML document to RenderedRole
 * @rolexjs/core
 */

import { defineTransformer, type Transformer } from "dpml";
import type { RenderedRole, ParsedThought, ParsedExecution } from "~/types.js";

/**
 * DPML Node interface (compatible with dpml 0.3.0)
 */
interface DPMLNode {
  tagName?: string;
  attributes?: Record<string, string>;
  children?: Array<DPMLNode | string>;
  content?: string;
}

/**
 * Extract text content from a node
 * DPML 0.3.0: text content is in node.content, child elements are in node.children
 */
function extractTextContent(node: DPMLNode): string {
  const parts: string[] = [];

  // Add node's own text content first
  if (node.content) {
    parts.push(node.content);
  }

  // Then add children's content
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      if (typeof child === "string") {
        parts.push(child);
      } else if (child.tagName) {
        // Element node - recursively extract
        parts.push(extractTextContent(child));
      } else if (child.content) {
        // Text node with content
        parts.push(child.content);
      }
    }
  }

  return parts.join("\n").trim();
}

/**
 * Find child node by tag name
 */
function findChildByTagName(node: DPMLNode, tagName: string): DPMLNode | undefined {
  if (!node.children) return undefined;

  for (const child of node.children) {
    if (typeof child !== "string" && child.tagName === tagName) {
      return child;
    }
  }

  return undefined;
}

/**
 * Find all children by tag name
 */
function findAllChildrenByTagName(node: DPMLNode, tagName: string): DPMLNode[] {
  if (!node.children) return [];

  const results: DPMLNode[] = [];

  for (const child of node.children) {
    if (typeof child !== "string" && child.tagName === tagName) {
      results.push(child);
    }
  }

  return results;
}

/**
 * Parse thought node into ParsedThought
 */
function parseThought(node: DPMLNode): ParsedThought {
  return {
    exploration: findChildByTagName(node, "exploration")
      ? extractTextContent(findChildByTagName(node, "exploration")!)
      : undefined,
    reasoning: findChildByTagName(node, "reasoning")
      ? extractTextContent(findChildByTagName(node, "reasoning")!)
      : undefined,
    challenge: findChildByTagName(node, "challenge")
      ? extractTextContent(findChildByTagName(node, "challenge")!)
      : undefined,
    plan: findChildByTagName(node, "plan")
      ? extractTextContent(findChildByTagName(node, "plan")!)
      : undefined,
  };
}

/**
 * Parse execution node into ParsedExecution
 */
function parseExecution(node: DPMLNode): ParsedExecution {
  return {
    process: findChildByTagName(node, "process")
      ? extractTextContent(findChildByTagName(node, "process")!)
      : undefined,
    constraint: findChildByTagName(node, "constraint")
      ? extractTextContent(findChildByTagName(node, "constraint")!)
      : undefined,
    rule: findChildByTagName(node, "rule")
      ? extractTextContent(findChildByTagName(node, "rule")!)
      : undefined,
    guideline: findChildByTagName(node, "guideline")
      ? extractTextContent(findChildByTagName(node, "guideline")!)
      : undefined,
    criteria: findChildByTagName(node, "criteria")
      ? extractTextContent(findChildByTagName(node, "criteria")!)
      : undefined,
  };
}

/**
 * Render thought to text
 */
function renderThought(thought: ParsedThought): string {
  const parts: string[] = [];

  if (thought.exploration) parts.push(thought.exploration);
  if (thought.reasoning) parts.push(thought.reasoning);
  if (thought.challenge) parts.push(thought.challenge);
  if (thought.plan) parts.push(thought.plan);

  return parts.join("\n\n");
}

/**
 * Render execution to text
 */
function renderExecution(execution: ParsedExecution): string {
  const parts: string[] = [];

  if (execution.process) parts.push(execution.process);
  if (execution.constraint) parts.push(execution.constraint);
  if (execution.rule) parts.push(execution.rule);
  if (execution.guideline) parts.push(execution.guideline);
  if (execution.criteria) parts.push(execution.criteria);

  return parts.join("\n\n");
}

/**
 * Role Transformer
 * Transforms DPML role document into RenderedRole
 */
export const roleTransformer: Transformer<{ document: { rootNode: unknown } }, RenderedRole> =
  defineTransformer({
    name: "role-transformer",
    description: "Transform DPML role document to RenderedRole",

    transform(input: { document: { rootNode: unknown } }): RenderedRole {
      const doc = input.document;
      const rootNode = doc.rootNode as DPMLNode;

      if (!rootNode || rootNode.tagName !== "role") {
        throw new Error("Invalid role document: root element must be <role>");
      }

      // 1. Parse personality section
      const personalityNode = findChildByTagName(rootNode, "personality");
      let personalityContent = "";
      const thoughts: ParsedThought[] = [];

      if (personalityNode) {
        personalityContent = extractTextContent(personalityNode);
        const thoughtNodes = findAllChildrenByTagName(personalityNode, "thought");
        for (const thoughtNode of thoughtNodes) {
          thoughts.push(parseThought(thoughtNode));
        }
      }

      // 2. Parse principle section
      const principleNode = findChildByTagName(rootNode, "principle");
      let principleContent = "";
      const executions: ParsedExecution[] = [];

      if (principleNode) {
        principleContent = extractTextContent(principleNode);
        const executionNodes = findAllChildrenByTagName(principleNode, "execution");
        for (const executionNode of executionNodes) {
          executions.push(parseExecution(executionNode));
        }
      }

      // 3. Parse knowledge section
      const knowledgeNode = findChildByTagName(rootNode, "knowledge");
      const knowledgeContent = knowledgeNode ? extractTextContent(knowledgeNode) : "";

      // 4. Render each section
      const personalityParts = [personalityContent];
      for (const thought of thoughts) {
        const rendered = renderThought(thought);
        if (rendered) personalityParts.push(rendered);
      }
      const personality = personalityParts.filter(Boolean).join("\n\n");

      const principleParts = [principleContent];
      for (const execution of executions) {
        const rendered = renderExecution(execution);
        if (rendered) principleParts.push(rendered);
      }
      const principle = principleParts.filter(Boolean).join("\n\n");

      const knowledge = knowledgeContent;

      // 5. Assemble final prompt
      const promptParts: string[] = [];
      if (personality) promptParts.push(personality);
      if (principle) promptParts.push(principle);
      if (knowledge) promptParts.push(knowledge);

      const prompt = promptParts.join("\n\n---\n\n");

      return { prompt, personality, principle, knowledge };
    },
  });
