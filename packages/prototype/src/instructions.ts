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

const individualBorn = def("individual", "born", {
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the individual" },
  id: { type: "string", required: false, description: "User-facing identifier (kebab-case)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["content", "id", "alias"]);

const individualRetire = def("individual", "retire", {
  individual: { type: "string", required: true, description: "Individual id" },
}, ["individual"]);

const individualDie = def("individual", "die", {
  individual: { type: "string", required: true, description: "Individual id" },
}, ["individual"]);

const individualRehire = def("individual", "rehire", {
  individual: { type: "string", required: true, description: "Individual id (from past)" },
}, ["individual"]);

const individualTeach = def("individual", "teach", {
  individual: { type: "string", required: true, description: "Individual id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the principle" },
  id: { type: "string", required: false, description: "Principle id (keywords joined by hyphens)" },
}, ["individual", "content", "id"]);

const individualTrain = def("individual", "train", {
  individual: { type: "string", required: true, description: "Individual id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the procedure" },
  id: { type: "string", required: false, description: "Procedure id (keywords joined by hyphens)" },
}, ["individual", "content", "id"]);

// ================================================================
//  Role — execution + cognition
// ================================================================

const roleActivate = def("role", "activate", {
  individual: { type: "string", required: true, description: "Individual id to activate as role" },
}, ["individual"]);

const roleFocus = def("role", "focus", {
  goal: { type: "string", required: true, description: "Goal id to switch to" },
}, ["goal"]);

const roleWant = def("role", "want", {
  individual: { type: "string", required: true, description: "Individual id" },
  goal: { type: "gherkin", required: false, description: "Gherkin Feature source describing the goal" },
  id: { type: "string", required: false, description: "Goal id (used for focus/reference)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["individual", "goal", "id", "alias"]);

const rolePlan = def("role", "plan", {
  goal: { type: "string", required: true, description: "Goal id" },
  plan: { type: "gherkin", required: false, description: "Gherkin Feature source describing the plan" },
  id: { type: "string", required: false, description: "Plan id (keywords joined by hyphens)" },
  after: { type: "string", required: false, description: "Plan id this plan follows (sequential/phase)" },
  fallback: { type: "string", required: false, description: "Plan id this plan is a backup for (alternative/strategy)" },
}, ["goal", "plan", "id", "after", "fallback"]);

const roleTodo = def("role", "todo", {
  plan: { type: "string", required: true, description: "Plan id" },
  task: { type: "gherkin", required: false, description: "Gherkin Feature source describing the task" },
  id: { type: "string", required: false, description: "Task id (used for finish/reference)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["plan", "task", "id", "alias"]);

const roleFinish = def("role", "finish", {
  task: { type: "string", required: true, description: "Task id to finish" },
  individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
  encounter: { type: "gherkin", required: false, description: "Optional Gherkin Feature describing what happened" },
}, ["task", "individual", "encounter"]);

const roleComplete = def("role", "complete", {
  plan: { type: "string", required: true, description: "Plan id to complete" },
  individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
  encounter: { type: "gherkin", required: false, description: "Optional Gherkin Feature describing what happened" },
}, ["plan", "individual", "encounter"]);

const roleAbandon = def("role", "abandon", {
  plan: { type: "string", required: true, description: "Plan id to abandon" },
  individual: { type: "string", required: true, description: "Individual id (encounter owner)" },
  encounter: { type: "gherkin", required: false, description: "Optional Gherkin Feature describing what happened" },
}, ["plan", "individual", "encounter"]);

const roleReflect = def("role", "reflect", {
  encounter: { type: "string", required: true, description: "Encounter id to reflect on" },
  individual: { type: "string", required: true, description: "Individual id" },
  experience: { type: "gherkin", required: false, description: "Gherkin Feature source for the experience" },
  id: { type: "string", required: false, description: "Experience id (keywords joined by hyphens)" },
}, ["encounter", "individual", "experience", "id"]);

const roleRealize = def("role", "realize", {
  experience: { type: "string", required: true, description: "Experience id to distill" },
  individual: { type: "string", required: true, description: "Individual id" },
  principle: { type: "gherkin", required: false, description: "Gherkin Feature source for the principle" },
  id: { type: "string", required: false, description: "Principle id (keywords joined by hyphens)" },
}, ["experience", "individual", "principle", "id"]);

const roleMaster = def("role", "master", {
  individual: { type: "string", required: true, description: "Individual id" },
  procedure: { type: "gherkin", required: true, description: "Gherkin Feature source for the procedure" },
  id: { type: "string", required: false, description: "Procedure id (keywords joined by hyphens)" },
  experience: { type: "string", required: false, description: "Experience id to consume (optional)" },
}, ["individual", "procedure", "id", "experience"]);

const roleForget = def("role", "forget", {
  id: { type: "string", required: true, description: "Id of the node to remove" },
  individual: { type: "string", required: true, description: "Individual id (owner)" },
}, ["id", "individual"]);

const roleSkill = def("role", "skill", {
  locator: { type: "string", required: true, description: "ResourceX locator for the skill" },
}, ["locator"]);

// ================================================================
//  Org — organization management
// ================================================================

const orgFound = def("org", "found", {
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the organization" },
  id: { type: "string", required: false, description: "User-facing identifier (kebab-case)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["content", "id", "alias"]);

const orgCharter = def("org", "charter", {
  org: { type: "string", required: true, description: "Organization id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the charter" },
}, ["org", "content"]);

const orgDissolve = def("org", "dissolve", {
  org: { type: "string", required: true, description: "Organization id" },
}, ["org"]);

const orgHire = def("org", "hire", {
  org: { type: "string", required: true, description: "Organization id" },
  individual: { type: "string", required: true, description: "Individual id" },
}, ["org", "individual"]);

const orgFire = def("org", "fire", {
  org: { type: "string", required: true, description: "Organization id" },
  individual: { type: "string", required: true, description: "Individual id" },
}, ["org", "individual"]);

// ================================================================
//  Position — position management
// ================================================================

const positionEstablish = def("position", "establish", {
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the position" },
  id: { type: "string", required: false, description: "User-facing identifier (kebab-case)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["content", "id", "alias"]);

const positionCharge = def("position", "charge", {
  position: { type: "string", required: true, description: "Position id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the duty" },
  id: { type: "string", required: false, description: "Duty id (keywords joined by hyphens)" },
}, ["position", "content", "id"]);

const positionRequire = def("position", "require", {
  position: { type: "string", required: true, description: "Position id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the skill requirement" },
  id: { type: "string", required: false, description: "Requirement id (keywords joined by hyphens)" },
}, ["position", "content", "id"]);

const positionAbolish = def("position", "abolish", {
  position: { type: "string", required: true, description: "Position id" },
}, ["position"]);

const positionAppoint = def("position", "appoint", {
  position: { type: "string", required: true, description: "Position id" },
  individual: { type: "string", required: true, description: "Individual id" },
}, ["position", "individual"]);

const positionDismiss = def("position", "dismiss", {
  position: { type: "string", required: true, description: "Position id" },
  individual: { type: "string", required: true, description: "Individual id" },
}, ["position", "individual"]);

// ================================================================
//  Census — society-level queries
// ================================================================

const censusList = def("census", "list", {
  type: { type: "string", required: false, description: "Filter by type (individual, organization, position, past)" },
}, ["type"]);

// ================================================================
//  Prototype — registry + creation
// ================================================================

const prototypeSettle = def("prototype", "settle", {
  source: { type: "string", required: true, description: "ResourceX source — local path or locator" },
}, ["source"]);

const prototypeEvict = def("prototype", "evict", {
  id: { type: "string", required: true, description: "Prototype id to unregister" },
}, ["id"]);

const prototypeBorn = def("prototype", "born", {
  dir: { type: "string", required: true, description: "Output directory for the prototype" },
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the individual" },
  id: { type: "string", required: true, description: "Individual id (kebab-case)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["dir", "content", "id", "alias"]);

const prototypeTeach = def("prototype", "teach", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the principle" },
  id: { type: "string", required: true, description: "Principle id (keywords joined by hyphens)" },
}, ["dir", "content", "id"]);

const prototypeTrain = def("prototype", "train", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the procedure" },
  id: { type: "string", required: true, description: "Procedure id (keywords joined by hyphens)" },
}, ["dir", "content", "id"]);

const prototypeFound = def("prototype", "found", {
  dir: { type: "string", required: true, description: "Output directory for the organization prototype" },
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the organization" },
  id: { type: "string", required: true, description: "Organization id (kebab-case)" },
  alias: { type: "string[]", required: false, description: "Alternative names" },
}, ["dir", "content", "id", "alias"]);

const prototypeCharter = def("prototype", "charter", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the charter" },
  id: { type: "string", required: false, description: "Charter id" },
}, ["dir", "content", "id"]);

const prototypeMember = def("prototype", "member", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  id: { type: "string", required: true, description: "Member individual id" },
  locator: { type: "string", required: true, description: "ResourceX locator for the member prototype" },
}, ["dir", "id", "locator"]);

const prototypeEstablish = def("prototype", "establish", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  content: { type: "gherkin", required: false, description: "Gherkin Feature source for the position" },
  id: { type: "string", required: true, description: "Position id (kebab-case)" },
  appointments: { type: "string[]", required: false, description: "Individual ids to auto-appoint" },
}, ["dir", "content", "id", "appointments"]);

const prototypeCharge = def("prototype", "charge", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  position: { type: "string", required: true, description: "Position id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the duty" },
  id: { type: "string", required: true, description: "Duty id (keywords joined by hyphens)" },
}, ["dir", "position", "content", "id"]);

const prototypeRequire = def("prototype", "require", {
  dir: { type: "string", required: true, description: "Prototype directory" },
  position: { type: "string", required: true, description: "Position id" },
  content: { type: "gherkin", required: true, description: "Gherkin Feature source for the skill requirement" },
  id: { type: "string", required: true, description: "Requirement id (keywords joined by hyphens)" },
}, ["dir", "position", "content", "id"]);

// ================================================================
//  Resource — ResourceX proxy
// ================================================================

const resourceAdd = def("resource", "add", {
  path: { type: "string", required: true, description: "Path to resource directory" },
}, ["path"]);

const resourceSearch = def("resource", "search", {
  query: { type: "string", required: false, description: "Search query" },
}, ["query"]);

const resourceHas = def("resource", "has", {
  locator: { type: "string", required: true, description: "Resource locator" },
}, ["locator"]);

const resourceInfo = def("resource", "info", {
  locator: { type: "string", required: true, description: "Resource locator" },
}, ["locator"]);

const resourceRemove = def("resource", "remove", {
  locator: { type: "string", required: true, description: "Resource locator" },
}, ["locator"]);

const resourcePush = def("resource", "push", {
  locator: { type: "string", required: true, description: "Resource locator" },
  registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
}, ["locator", { pack: ["registry"] }]);

const resourcePull = def("resource", "pull", {
  locator: { type: "string", required: true, description: "Resource locator" },
  registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
}, ["locator", { pack: ["registry"] }]);

const resourceClearCache = def("resource", "clearCache", {
  registry: { type: "string", required: false, description: "Registry to clear cache for" },
}, ["registry"]);

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

  // census
  "census.list": censusList,

  // prototype
  "prototype.settle": prototypeSettle,
  "prototype.evict": prototypeEvict,
  "prototype.born": prototypeBorn,
  "prototype.teach": prototypeTeach,
  "prototype.train": prototypeTrain,
  "prototype.found": prototypeFound,
  "prototype.charter": prototypeCharter,
  "prototype.member": prototypeMember,
  "prototype.establish": prototypeEstablish,
  "prototype.charge": prototypeCharge,
  "prototype.require": prototypeRequire,

  // resource
  "resource.add": resourceAdd,
  "resource.search": resourceSearch,
  "resource.has": resourceHas,
  "resource.info": resourceInfo,
  "resource.remove": resourceRemove,
  "resource.push": resourcePush,
  "resource.pull": resourcePull,
  "resource.clearCache": resourceClearCache,
};
