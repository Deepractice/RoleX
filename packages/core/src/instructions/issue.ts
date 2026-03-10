import { def } from "./def.js";

export const issuePublish = def(
  "issue",
  "publish",
  {
    title: { type: "string", required: true, description: "Issue title" },
    body: { type: "string", required: true, description: "Issue body/description" },
    author: { type: "string", required: true, description: "Author individual id" },
    assignee: { type: "string", required: false, description: "Assignee individual id" },
  },
  ["title", "body", "author", "assignee"]
);

export const issueGet = def(
  "issue",
  "get",
  {
    number: { type: "number", required: true, description: "Issue number" },
  },
  ["number"]
);

export const issueList = def(
  "issue",
  "list",
  {
    status: { type: "string", required: false, description: "Filter by status (open/closed)" },
    author: { type: "string", required: false, description: "Filter by author" },
    assignee: { type: "string", required: false, description: "Filter by assignee" },
    label: { type: "string", required: false, description: "Filter by label name" },
  },
  ["status", "author", "assignee", "label"]
);

export const issueUpdate = def(
  "issue",
  "update",
  {
    number: { type: "number", required: true, description: "Issue number" },
    title: { type: "string", required: false, description: "New title" },
    body: { type: "string", required: false, description: "New body" },
    assignee: { type: "string", required: false, description: "New assignee" },
  },
  ["number", "title", "body", "assignee"]
);

export const issueClose = def(
  "issue",
  "close",
  {
    number: { type: "number", required: true, description: "Issue number to close" },
  },
  ["number"]
);

export const issueReopen = def(
  "issue",
  "reopen",
  {
    number: { type: "number", required: true, description: "Issue number to reopen" },
  },
  ["number"]
);

export const issueAssign = def(
  "issue",
  "assign",
  {
    number: { type: "number", required: true, description: "Issue number" },
    assignee: { type: "string", required: true, description: "Individual id to assign" },
  },
  ["number", "assignee"]
);

export const issueComment = def(
  "issue",
  "comment",
  {
    number: { type: "number", required: true, description: "Issue number" },
    body: { type: "string", required: true, description: "Comment body" },
    author: { type: "string", required: true, description: "Author individual id" },
  },
  ["number", "body", "author"]
);

export const issueComments = def(
  "issue",
  "comments",
  {
    number: { type: "number", required: true, description: "Issue number" },
  },
  ["number"]
);

export const issueLabel = def(
  "issue",
  "label",
  {
    number: { type: "number", required: true, description: "Issue number" },
    label: { type: "string", required: true, description: "Label name" },
  },
  ["number", "label"]
);

export const issueUnlabel = def(
  "issue",
  "unlabel",
  {
    number: { type: "number", required: true, description: "Issue number" },
    label: { type: "string", required: true, description: "Label name to remove" },
  },
  ["number", "label"]
);
