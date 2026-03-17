/**
 * Commands — issue.* commands.
 *
 * Issues are graph nodes under society, with comments as child nodes.
 * Status is expressed via tags (#open / #closed).
 * Author and assignee are links to individual nodes.
 */

import type { State, Structure } from "@rolexjs/system";
import * as C from "../structures.js";
import type { Helpers } from "./helpers.js";
import type { CommandContext, CommandResult } from "./types.js";

// ================================================================
//  Issue number counter
// ================================================================

/** Track the next issue number per runtime instance. */
let nextIssueNumber = 0;

/** Scan existing issues to find the max number. */
function initCounter(children: readonly State[]): void {
  let max = 0;
  for (const child of children) {
    if (child.name === "issue" && child.id) {
      const match = child.id.match(/^issue-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    }
  }
  nextIssueNumber = max;
}

function allocateNumber(): number {
  return ++nextIssueNumber;
}

// ================================================================
//  Issue commands
// ================================================================

export function issueCommands(
  ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { rt, society, resolve, project } = ctx;
  const { ok } = helpers;

  // Lazy-init counter on first issue command
  let counterInitialized = false;
  async function ensureCounter(): Promise<void> {
    if (counterInitialized) return;
    const state = await rt.project(society);
    initCounter(state.children ?? []);
    counterInitialized = true;
  }

  /** Find an issue node by number (issue-{N} id pattern). */
  async function findIssue(number: number): Promise<Structure> {
    const id = `issue-${number}`;
    const node = await resolve(id);
    return node;
  }

  return {
    async "issue.publish"(
      title: string,
      body: string,
      author: string,
      assignee?: string
    ): Promise<CommandResult> {
      await ensureCounter();
      const number = allocateNumber();
      const id = `issue-${number}`;
      const node = await rt.create(society, C.issue, body, id, [title]);
      await rt.addTag(node, "open");

      // Link author
      const authorNode = await resolve(author);
      await rt.link(node, authorNode, "authored-by", "author-of");

      // Link assignee if provided
      if (assignee) {
        const assigneeNode = await resolve(assignee);
        await rt.link(node, assigneeNode, "assigned-to", "assigned");
      }

      return ok(node, "publish");
    },

    async "issue.get"(number: number): Promise<CommandResult> {
      const node = await findIssue(number);
      return ok(node, "get");
    },

    async "issue.list"(
      status?: string,
      _author?: string,
      _assignee?: string,
      _label?: string
    ): Promise<CommandResult> {
      const state = await project(society);
      const issues = (state.children ?? []).filter((c) => {
        if (c.name !== "issue") return false;
        if (status && !c.tags?.includes(status)) return false;
        return true;
      });
      return {
        state: { ...state, children: issues },
        process: "list",
      };
    },

    async "issue.update"(
      number: number,
      title?: string,
      body?: string,
      assignee?: string
    ): Promise<CommandResult> {
      const node = await findIssue(number);

      // Update title (alias) and body (information) by removing and recreating
      // For now, we update via transform if needed
      if (body !== undefined || title !== undefined) {
        // We need to work with what the runtime provides
        // Transform preserves subtree but updates information
        const target = C.issue;
        if (body !== undefined) {
          await rt.transform(node, target, body);
        }
      }

      if (assignee !== undefined) {
        // Unlink existing assignee, link new one
        const state = await rt.project(node);
        const existingAssignee = state.links?.find((l) => l.relation === "assigned-to");
        if (existingAssignee) {
          await rt.unlink(node, existingAssignee.target, "assigned-to", "assigned");
        }
        if (assignee) {
          const assigneeNode = await resolve(assignee);
          await rt.link(node, assigneeNode, "assigned-to", "assigned");
        }
      }

      return ok(node, "update");
    },

    async "issue.close"(number: number): Promise<CommandResult> {
      const node = await findIssue(number);
      await rt.removeTag(node, "open");
      await rt.addTag(node, "closed");
      return ok(node, "close");
    },

    async "issue.reopen"(number: number): Promise<CommandResult> {
      const node = await findIssue(number);
      await rt.removeTag(node, "closed");
      await rt.addTag(node, "open");
      return ok(node, "reopen");
    },

    async "issue.assign"(number: number, assignee: string): Promise<CommandResult> {
      const node = await findIssue(number);

      // Unlink existing assignee
      const state = await rt.project(node);
      const existingAssignee = state.links?.find((l) => l.relation === "assigned-to");
      if (existingAssignee) {
        await rt.unlink(node, existingAssignee.target, "assigned-to", "assigned");
      }

      // Link new assignee
      const assigneeNode = await resolve(assignee);
      await rt.link(node, assigneeNode, "assigned-to", "assigned");

      return ok(node, "assign");
    },

    async "issue.comment"(number: number, body: string, author: string): Promise<CommandResult> {
      const issueNode = await findIssue(number);
      const commentNode = await rt.create(issueNode, C.comment, body);

      // Link comment author
      const authorNode = await resolve(author);
      await rt.link(commentNode, authorNode, "authored-by", "author-of");

      return ok(commentNode, "comment");
    },

    async "issue.comments"(number: number): Promise<CommandResult> {
      const issueNode = await findIssue(number);
      const state = await project(issueNode);
      const comments = (state.children ?? []).filter((c) => c.name === "comment");
      return {
        state: { ...state, children: comments },
        process: "comments",
      };
    },

    async "issue.label"(number: number, label: string): Promise<CommandResult> {
      const node = await findIssue(number);
      await rt.addTag(node, label);
      return ok(node, "label");
    },

    async "issue.unlabel"(number: number, label: string): Promise<CommandResult> {
      const node = await findIssue(number);
      await rt.removeTag(node, label);
      return ok(node, "unlabel");
    },
  };
}
