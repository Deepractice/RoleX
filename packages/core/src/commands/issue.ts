/**
 * Commands — issue.* commands.
 */

import type { Comment, Issue } from "issuexjs";
import type { Helpers } from "./helpers.js";
import type { CommandContext } from "./types.js";

export function issueCommands(
  _ctx: CommandContext,
  helpers: Helpers
): Record<string, (...args: any[]) => any> {
  const { requireIssueX } = helpers;

  return {
    async "issue.publish"(
      title: string,
      body: string,
      author: string,
      assignee?: string
    ): Promise<Issue> {
      const ix = requireIssueX();
      return ix.createIssue({ title, body, author, assignee });
    },

    async "issue.get"(number: number): Promise<Issue | null> {
      return requireIssueX().getIssueByNumber(number);
    },

    async "issue.list"(
      status?: string,
      author?: string,
      assignee?: string,
      label?: string
    ): Promise<Issue[]> {
      const filter: Record<string, string> = {};
      if (status) filter.status = status;
      if (author) filter.author = author;
      if (assignee) filter.assignee = assignee;
      if (label) filter.label = label;
      return requireIssueX().listIssues(
        Object.keys(filter).length > 0 ? (filter as any) : undefined
      );
    },

    async "issue.update"(
      number: number,
      title?: string,
      body?: string,
      assignee?: string
    ): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.title = title;
      if (body !== undefined) patch.body = body;
      if (assignee !== undefined) patch.assignee = assignee;
      return ix.updateIssue(issue.id, patch);
    },

    async "issue.close"(number: number): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.closeIssue(issue.id);
    },

    async "issue.reopen"(number: number): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.reopenIssue(issue.id);
    },

    async "issue.assign"(number: number, assignee: string): Promise<Issue> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.updateIssue(issue.id, { assignee });
    },

    async "issue.comment"(number: number, body: string, author: string): Promise<Comment> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.createComment(issue.id, body, author);
    },

    async "issue.comments"(number: number): Promise<Comment[]> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      return ix.listComments(issue.id);
    },

    async "issue.label"(number: number, label: string): Promise<Issue | null> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      // Find or create label by name
      let labelObj = await ix.getLabelByName(label);
      if (!labelObj) labelObj = await ix.createLabel({ name: label });
      await ix.addLabel(issue.id, labelObj.id);
      return ix.getIssueByNumber(number);
    },

    async "issue.unlabel"(number: number, label: string): Promise<Issue | null> {
      const ix = requireIssueX();
      const issue = await ix.getIssueByNumber(number);
      if (!issue) throw new Error(`Issue #${number} not found.`);
      const labelObj = await ix.getLabelByName(label);
      if (!labelObj) throw new Error(`Label "${label}" not found.`);
      await ix.removeLabel(issue.id, labelObj.id);
      return ix.getIssueByNumber(number);
    },
  };
}
