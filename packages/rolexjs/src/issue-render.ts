/**
 * Issue Render — format IssueX data as readable text.
 *
 * Lightweight rendering for issue operations.
 * Unlike the core render layer (which projects State trees),
 * this module formats flat IssueX objects into human-readable strings.
 */
import type { Comment, Issue } from "issuexjs";

// ================================================================
//  Types
// ================================================================

export type IssueAction =
  | "publish"
  | "get"
  | "list"
  | "close"
  | "reopen"
  | "update"
  | "assign"
  | "comment"
  | "comments"
  | "label"
  | "unlabel";

export type LabelResolver = (ids: string[]) => Promise<string[]>;

// ================================================================
//  Single Issue
// ================================================================

export function renderIssue(issue: Issue, labelNames?: string[]): string {
  const lines: string[] = [];

  lines.push(`#${issue.number} ${issue.title} [${issue.status}]`);

  const meta: string[] = [`Author: ${issue.author}`];
  if (issue.assignee) meta.push(`Assignee: ${issue.assignee}`);
  if (labelNames && labelNames.length > 0) {
    meta.push(`Labels: ${labelNames.join(", ")}`);
  }
  lines.push(meta.join(" | "));

  if (issue.body) {
    lines.push("───");
    lines.push(issue.body);
  }

  return lines.join("\n");
}

// ================================================================
//  Issue List
// ================================================================

export function renderIssueList(issues: Issue[]): string {
  if (issues.length === 0) return "No issues found.";

  const lines: string[] = [];
  for (const issue of issues) {
    const assignee = issue.assignee ? ` → ${issue.assignee}` : "";
    lines.push(`#${issue.number}  [${issue.status}]  ${issue.title}  (${issue.author}${assignee})`);
  }
  return lines.join("\n");
}

// ================================================================
//  Comments
// ================================================================

export function renderComment(comment: Comment): string {
  const time = formatTime(comment.createdAt);
  return `${comment.author} (${time}):\n${comment.body}`;
}

export function renderCommentList(comments: Comment[]): string {
  if (comments.length === 0) return "No comments.";
  return comments.map(renderComment).join("\n───\n");
}

// ================================================================
//  Status line
// ================================================================

const statusTemplates: Record<string, (issue: Issue) => string> = {
  publish: (i) => `Issue #${i.number} created.`,
  close: (i) => `Issue #${i.number} closed.`,
  reopen: (i) => `Issue #${i.number} reopened.`,
  update: (i) => `Issue #${i.number} updated.`,
  assign: (i) => `Issue #${i.number} assigned to ${i.assignee ?? "nobody"}.`,
  comment: (i) => `Comment added to #${i.number}.`,
  label: (i) => `Label added to #${i.number}.`,
  unlabel: (i) => `Label removed from #${i.number}.`,
};

// ================================================================
//  Compose — the main entry point for Role.use()
// ================================================================

/**
 * Render an issue operation result as readable text.
 * Dispatches to the right renderer based on action.
 */
export async function renderIssueResult(
  action: IssueAction,
  result: unknown,
  resolveLabels?: LabelResolver
): Promise<string> {
  switch (action) {
    case "list":
      return renderIssueList(result as Issue[]);

    case "comments":
      return renderCommentList(result as Comment[]);

    case "comment": {
      const comment = result as Comment;
      return `Comment added to issue.\n\n${renderComment(comment)}`;
    }

    case "get": {
      if (!result) return "Issue not found.";
      const issue = result as Issue;
      const labelNames = await resolveLabelNames(issue, resolveLabels);
      return renderIssue(issue, labelNames);
    }

    default: {
      // All other actions return an Issue with a status line
      const issue = result as Issue;
      const labelNames = await resolveLabelNames(issue, resolveLabels);
      const status = statusTemplates[action]?.(issue) ?? `Issue #${issue.number} ${action}.`;
      return `${status}\n\n${renderIssue(issue, labelNames)}`;
    }
  }
}

// ================================================================
//  Helpers
// ================================================================

function formatTime(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+Z$/, "");
}

async function resolveLabelNames(
  issue: Issue,
  resolveLabels?: LabelResolver
): Promise<string[] | undefined> {
  if (!issue.labels || issue.labels.length === 0) return undefined;
  if (!resolveLabels) return undefined;
  return resolveLabels(issue.labels);
}
