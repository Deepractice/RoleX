/**
 * Instruction set — schema definitions for all RoleX operations.
 *
 * Covers every namespace.method that can be dispatched through `use()`.
 */

import type { ArgEntry, InstructionDef } from "./schema.js";

function def(
  namespace: string,
  method: string,
  params: InstructionDef["params"],
  args: readonly ArgEntry[]
): InstructionDef {
  return { namespace, method, params, args };
}

// ================================================================
//  Individual — lifecycle + external injection
// ================================================================

const individualBorn = def(
  "individual",
  "born",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the individual",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["content", "id", "alias"]
);

const individualRetire = def(
  "individual",
  "retire",
  {
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["individual"]
);

const individualDie = def(
  "individual",
  "die",
  {
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["individual"]
);

const individualRehire = def(
  "individual",
  "rehire",
  {
    individual: { type: "string", required: true, description: "Individual id (from past)" },
  },
  ["individual"]
);

const individualTeach = def(
  "individual",
  "teach",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the principle",
    },
    id: {
      type: "string",
      required: true,
      description: "Principle id (keywords joined by hyphens)",
    },
  },
  ["individual", "content", "id"]
);

const individualTrain = def(
  "individual",
  "train",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the procedure",
    },
    id: {
      type: "string",
      required: true,
      description: "Procedure id (keywords joined by hyphens)",
    },
  },
  ["individual", "content", "id"]
);

// ================================================================
//  Role — execution + cognition
// ================================================================

const roleActivate = def(
  "role",
  "activate",
  {
    individual: {
      type: "string",
      required: true,
      description: "Individual id to activate as role",
    },
  },
  ["individual"]
);

const roleFocus = def(
  "role",
  "focus",
  {
    goal: { type: "string", required: true, description: "Goal id to switch to" },
  },
  ["goal"]
);

const roleWant = def(
  "role",
  "want",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    goal: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the goal",
    },
    id: { type: "string", required: true, description: "Goal id (used for focus/reference)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["individual", "goal", "id", "alias"]
);

const rolePlan = def(
  "role",
  "plan",
  {
    goal: { type: "string", required: true, description: "Goal id" },
    plan: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the plan",
    },
    id: { type: "string", required: true, description: "Plan id (keywords joined by hyphens)" },
    after: {
      type: "string",
      required: false,
      description: "Plan id this plan follows (sequential/phase)",
    },
    fallback: {
      type: "string",
      required: false,
      description: "Plan id this plan is a backup for (alternative/strategy)",
    },
  },
  ["goal", "plan", "id", "after", "fallback"]
);

const roleTodo = def(
  "role",
  "todo",
  {
    plan: { type: "string", required: true, description: "Plan id" },
    task: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source describing the task",
    },
    id: { type: "string", required: true, description: "Task id (used for finish/reference)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["plan", "task", "id", "alias"]
);

const roleFinish = def(
  "role",
  "finish",
  {
    task: { type: "string", required: true, description: "Task id to finish" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["task", "individual", "encounter"]
);

const roleComplete = def(
  "role",
  "complete",
  {
    plan: { type: "string", required: true, description: "Plan id to complete" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["plan", "individual", "encounter"]
);

const roleAbandon = def(
  "role",
  "abandon",
  {
    plan: { type: "string", required: true, description: "Plan id to abandon" },
    individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
    encounter: {
      type: "gherkin",
      required: false,
      description: "Optional Gherkin Feature describing what happened",
    },
  },
  ["plan", "individual", "encounter"]
);

const roleReflect = def(
  "role",
  "reflect",
  {
    encounter: { type: "string", required: true, description: "Encounter id to reflect on" },
    individual: { type: "string", required: true, description: "Individual id" },
    experience: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the experience",
    },
    id: {
      type: "string",
      required: true,
      description: "Experience id (keywords joined by hyphens)",
    },
  },
  ["encounter", "individual", "experience", "id"]
);

const roleRealize = def(
  "role",
  "realize",
  {
    experience: { type: "string", required: true, description: "Experience id to distill" },
    individual: { type: "string", required: true, description: "Individual id" },
    principle: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the principle",
    },
    id: {
      type: "string",
      required: true,
      description: "Principle id (keywords joined by hyphens)",
    },
  },
  ["experience", "individual", "principle", "id"]
);

const roleMaster = def(
  "role",
  "master",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    procedure: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the procedure",
    },
    id: {
      type: "string",
      required: true,
      description: "Procedure id (keywords joined by hyphens)",
    },
    experience: {
      type: "string",
      required: false,
      description: "Experience id to consume (optional)",
    },
  },
  ["individual", "procedure", "id", "experience"]
);

const roleForget = def(
  "role",
  "forget",
  {
    id: { type: "string", required: true, description: "Id of the node to remove" },
    individual: { type: "string", required: true, description: "Individual id (owner)" },
  },
  ["id", "individual"]
);

const roleSkill = def(
  "role",
  "skill",
  {
    locator: { type: "string", required: true, description: "ResourceX locator for the skill" },
  },
  ["locator"]
);

// ================================================================
//  Org — organization management
// ================================================================

const orgFound = def(
  "org",
  "found",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the organization",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["content", "id", "alias"]
);

const orgCharter = def(
  "org",
  "charter",
  {
    org: { type: "string", required: true, description: "Organization id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the charter",
    },
    id: { type: "string", required: true, description: "Charter id" },
  },
  ["org", "content", "id"]
);

const orgDissolve = def(
  "org",
  "dissolve",
  {
    org: { type: "string", required: true, description: "Organization id" },
  },
  ["org"]
);

const orgHire = def(
  "org",
  "hire",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);

const orgFire = def(
  "org",
  "fire",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);

// ================================================================
//  Position — position management
// ================================================================

const positionEstablish = def(
  "position",
  "establish",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the position",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["content", "id", "alias"]
);

const positionCharge = def(
  "position",
  "charge",
  {
    position: { type: "string", required: true, description: "Position id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the duty",
    },
    id: { type: "string", required: true, description: "Duty id (keywords joined by hyphens)" },
  },
  ["position", "content", "id"]
);

const positionRequire = def(
  "position",
  "require",
  {
    position: { type: "string", required: true, description: "Position id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the skill requirement",
    },
    id: {
      type: "string",
      required: true,
      description: "Requirement id (keywords joined by hyphens)",
    },
  },
  ["position", "content", "id"]
);

const positionAbolish = def(
  "position",
  "abolish",
  {
    position: { type: "string", required: true, description: "Position id" },
  },
  ["position"]
);

const positionAppoint = def(
  "position",
  "appoint",
  {
    position: { type: "string", required: true, description: "Position id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["position", "individual"]
);

const positionDismiss = def(
  "position",
  "dismiss",
  {
    position: { type: "string", required: true, description: "Position id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["position", "individual"]
);

// ================================================================
//  Project — project management
// ================================================================

const projectLaunch = def(
  "project",
  "launch",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the project",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
    org: {
      type: "string",
      required: false,
      description: "Organization id that owns this project",
    },
  },
  ["content", "id", "alias", "org"]
);

const projectScope = def(
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

const projectMilestone = def(
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

const projectAchieve = def(
  "project",
  "achieve",
  {
    milestone: { type: "string", required: true, description: "Milestone id to mark as done" },
  },
  ["milestone"]
);

const projectEnroll = def(
  "project",
  "enroll",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);

const projectRemove = def(
  "project",
  "remove",
  {
    project: { type: "string", required: true, description: "Project id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["project", "individual"]
);

const projectDeliver = def(
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

const projectWiki = def(
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

const projectArchive = def(
  "project",
  "archive",
  {
    project: { type: "string", required: true, description: "Project id" },
  },
  ["project"]
);

const projectProduce = def(
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
  },
  ["project", "content", "id", "alias"]
);

// ================================================================
//  Product — product management (created via project.produce)
// ================================================================

const productStrategy = def(
  "product",
  "strategy",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the strategy",
    },
    id: { type: "string", required: true, description: "Strategy id" },
  },
  ["product", "content", "id"]
);

const productSpec = def(
  "product",
  "spec",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the behavior contract (BDD specification)",
    },
    id: {
      type: "string",
      required: true,
      description: "Spec id (keywords joined by hyphens)",
    },
  },
  ["product", "content", "id"]
);

const productRelease = def(
  "product",
  "release",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the release",
    },
    id: {
      type: "string",
      required: true,
      description: "Release id (e.g. v1.0.0)",
    },
  },
  ["product", "content", "id"]
);

const productChannel = def(
  "product",
  "channel",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the distribution channel",
    },
    id: {
      type: "string",
      required: true,
      description: "Channel id (e.g. npm, cloud-platform)",
    },
  },
  ["product", "content", "id"]
);

const productOwn = def(
  "product",
  "own",
  {
    product: { type: "string", required: true, description: "Product id" },
    individual: { type: "string", required: true, description: "Individual id (owner)" },
  },
  ["product", "individual"]
);

const productDisown = def(
  "product",
  "disown",
  {
    product: { type: "string", required: true, description: "Product id" },
    individual: { type: "string", required: true, description: "Individual id (owner to remove)" },
  },
  ["product", "individual"]
);

const productDeprecate = def(
  "product",
  "deprecate",
  {
    product: { type: "string", required: true, description: "Product id" },
  },
  ["product"]
);

// ================================================================
//  Society — sovereign operations (internal, not exposed as tools)
// ================================================================

const societyCrown = def(
  "society",
  "crown",
  {
    individual: { type: "string", required: true, description: "Individual id to crown" },
  },
  ["individual"]
);

const societyUncrown = def(
  "society",
  "uncrown",
  {
    individual: { type: "string", required: true, description: "Individual id to uncrown" },
  },
  ["individual"]
);

// ================================================================
//  Census — society-level queries
// ================================================================

const censusList = def(
  "census",
  "list",
  {
    type: {
      type: "string",
      required: false,
      description: "Filter by type (individual, organization, position, project, product, past)",
    },
  },
  ["type"]
);

// ================================================================
//  Prototype — registry + creation
// ================================================================

const prototypeEvict = def(
  "prototype",
  "evict",
  {
    id: { type: "string", required: true, description: "Prototype id to unregister" },
  },
  ["id"]
);

// ================================================================
//  Resource — ResourceX proxy
// ================================================================

const resourceAdd = def(
  "resource",
  "add",
  {
    path: { type: "string", required: true, description: "Path to resource directory" },
  },
  ["path"]
);

const resourceSearch = def(
  "resource",
  "search",
  {
    query: { type: "string", required: false, description: "Search query" },
  },
  ["query"]
);

const resourceHas = def(
  "resource",
  "has",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

const resourceInfo = def(
  "resource",
  "info",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

const resourceRemove = def(
  "resource",
  "remove",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

const resourcePush = def(
  "resource",
  "push",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
    registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
  },
  ["locator", { pack: ["registry"] }]
);

const resourcePull = def(
  "resource",
  "pull",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
    registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
  },
  ["locator", { pack: ["registry"] }]
);

const resourceClearCache = def(
  "resource",
  "clearCache",
  {
    registry: { type: "string", required: false, description: "Registry to clear cache for" },
  },
  ["registry"]
);

// ================================================================
//  Issue — IssueX proxy
// ================================================================

const issuePublish = def(
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

const issueGet = def(
  "issue",
  "get",
  {
    number: { type: "number", required: true, description: "Issue number" },
  },
  ["number"]
);

const issueList = def(
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

const issueUpdate = def(
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

const issueClose = def(
  "issue",
  "close",
  {
    number: { type: "number", required: true, description: "Issue number to close" },
  },
  ["number"]
);

const issueReopen = def(
  "issue",
  "reopen",
  {
    number: { type: "number", required: true, description: "Issue number to reopen" },
  },
  ["number"]
);

const issueAssign = def(
  "issue",
  "assign",
  {
    number: { type: "number", required: true, description: "Issue number" },
    assignee: { type: "string", required: true, description: "Individual id to assign" },
  },
  ["number", "assignee"]
);

const issueComment = def(
  "issue",
  "comment",
  {
    number: { type: "number", required: true, description: "Issue number" },
    body: { type: "string", required: true, description: "Comment body" },
    author: { type: "string", required: true, description: "Author individual id" },
  },
  ["number", "body", "author"]
);

const issueComments = def(
  "issue",
  "comments",
  {
    number: { type: "number", required: true, description: "Issue number" },
  },
  ["number"]
);

const issueLabel = def(
  "issue",
  "label",
  {
    number: { type: "number", required: true, description: "Issue number" },
    label: { type: "string", required: true, description: "Label name" },
  },
  ["number", "label"]
);

const issueUnlabel = def(
  "issue",
  "unlabel",
  {
    number: { type: "number", required: true, description: "Issue number" },
    label: { type: "string", required: true, description: "Label name to remove" },
  },
  ["number", "label"]
);

// ================================================================
//  Instruction registry — keyed by "namespace.method"
// ================================================================

export const instructions: Record<string, InstructionDef> = {
  // individual
  "individual.born": individualBorn,
  "individual.retire": individualRetire,
  "individual.die": individualDie,
  "individual.rehire": individualRehire,
  "individual.teach": individualTeach,
  "individual.train": individualTrain,

  // role
  "role.activate": roleActivate,
  "role.focus": roleFocus,
  "role.want": roleWant,
  "role.plan": rolePlan,
  "role.todo": roleTodo,
  "role.finish": roleFinish,
  "role.complete": roleComplete,
  "role.abandon": roleAbandon,
  "role.reflect": roleReflect,
  "role.realize": roleRealize,
  "role.master": roleMaster,
  "role.forget": roleForget,
  "role.skill": roleSkill,

  // org
  "org.found": orgFound,
  "org.charter": orgCharter,
  "org.dissolve": orgDissolve,
  "org.hire": orgHire,
  "org.fire": orgFire,

  // position
  "position.establish": positionEstablish,
  "position.charge": positionCharge,
  "position.require": positionRequire,
  "position.abolish": positionAbolish,
  "position.appoint": positionAppoint,
  "position.dismiss": positionDismiss,

  // project
  "project.launch": projectLaunch,
  "project.scope": projectScope,
  "project.milestone": projectMilestone,
  "project.achieve": projectAchieve,
  "project.enroll": projectEnroll,
  "project.remove": projectRemove,
  "project.deliver": projectDeliver,
  "project.wiki": projectWiki,
  "project.archive": projectArchive,
  "project.produce": projectProduce,

  // product
  "product.strategy": productStrategy,
  "product.spec": productSpec,
  "product.release": productRelease,
  "product.channel": productChannel,
  "product.own": productOwn,
  "product.disown": productDisown,
  "product.deprecate": productDeprecate,

  // society (internal — dispatch only, not exposed as MCP tools)
  "society.crown": societyCrown,
  "society.uncrown": societyUncrown,

  // census
  "census.list": censusList,

  // prototype
  "prototype.evict": prototypeEvict,

  // resource
  "resource.add": resourceAdd,
  "resource.search": resourceSearch,
  "resource.has": resourceHas,
  "resource.info": resourceInfo,
  "resource.remove": resourceRemove,
  "resource.push": resourcePush,
  "resource.pull": resourcePull,
  "resource.clearCache": resourceClearCache,

  // issue
  "issue.publish": issuePublish,
  "issue.get": issueGet,
  "issue.list": issueList,
  "issue.update": issueUpdate,
  "issue.close": issueClose,
  "issue.reopen": issueReopen,
  "issue.assign": issueAssign,
  "issue.comment": issueComment,
  "issue.comments": issueComments,
  "issue.label": issueLabel,
  "issue.unlabel": issueUnlabel,
};
