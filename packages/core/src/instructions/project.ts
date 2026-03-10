import { def } from "./def.js";

export const projectScope = def(
  "project",
  "scope",
  {
    project: { type: "string", required: true, description: "Project id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the scope",
    },
    id: { type: "string", required: true, description: "Scope id" },
  },
  ["project", "content", "id"]
);

export const projectMilestone = def(
  "project",
  "milestone",
  {
    project: { type: "string", required: true, description: "Project id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the milestone",
    },
    id: {
      type: "string",
      required: true,
      description: "Milestone id (keywords joined by hyphens)",
    },
  },
  ["project", "content", "id"]
);

export const projectAchieve = def(
  "project",
  "achieve",
  {
    milestone: { type: "string", required: true, description: "Milestone id to mark as done" },
  },
  ["milestone"]
);

export const projectEnroll = def(
  "project",
  "enroll",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);

export const projectRemove = def(
  "project",
  "remove",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);

export const projectDeliver = def(
  "project",
  "deliver",
  {
    project: { type: "string", required: true, description: "Project id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the deliverable",
    },
    id: {
      type: "string",
      required: true,
      description: "Deliverable id (keywords joined by hyphens)",
    },
  },
  ["project", "content", "id"]
);

export const projectWiki = def(
  "project",
  "wiki",
  {
    project: { type: "string", required: true, description: "Project id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the wiki entry",
    },
    id: {
      type: "string",
      required: true,
      description: "Wiki entry id (keywords joined by hyphens)",
    },
  },
  ["project", "content", "id"]
);

export const projectProduce = def(
  "project",
  "produce",
  {
    project: { type: "string", required: true, description: "Project id" },
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the product (vision)",
    },
    id: { type: "string", required: true, description: "Product id (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
    owner: {
      type: "string",
      required: false,
      description: "Individual id of the first product owner",
    },
  },
  ["project", "content", "id", "alias", "owner"]
);

export const projectMaintain = def(
  "project",
  "maintain",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);

export const projectUnmaintain = def(
  "project",
  "unmaintain",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);
