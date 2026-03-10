/**
 * Instruction set — schema definitions for all RoleX operations.
 *
 * Covers every namespace.method that can be dispatched through `use()`.
 */

import type { InstructionDef } from "../schema.js";
import { def } from "./def.js";
import {
  issueAssign,
  issueClose,
  issueComment,
  issueComments,
  issueGet,
  issueLabel,
  issueList,
  issuePublish,
  issueReopen,
  issueUnlabel,
  issueUpdate,
} from "./issue.js";

import { orgAdmin, orgCharter, orgFire, orgHire, orgUnadmin } from "./org.js";

import {
  positionAbolish,
  positionAppoint,
  positionCharge,
  positionDismiss,
  positionEstablish,
  positionRequire,
} from "./position.js";
import {
  productChannel,
  productDeprecate,
  productDisown,
  productOwn,
  productRelease,
  productSpec,
  productStrategy,
} from "./product.js";
import {
  projectAchieve,
  projectArchive,
  projectDeliver,
  projectEnroll,
  projectLaunch,
  projectMaintain,
  projectMilestone,
  projectProduce,
  projectRemove,
  projectScope,
  projectUnmaintain,
  projectWiki,
} from "./project.js";

import {
  resourceAdd,
  resourceClearCache,
  resourceHas,
  resourceInfo,
  resourcePull,
  resourcePush,
  resourceRemove,
  resourceSearch,
} from "./resource.js";
import {
  roleAbandon,
  roleActivate,
  roleComplete,
  roleFinish,
  roleFocus,
  roleForget,
  roleMaster,
  rolePlan,
  roleRealize,
  roleReflect,
  roleSkill,
  roleTodo,
  roleWant,
} from "./role.js";
import {
  societyBorn,
  societyCrown,
  societyDie,
  societyDissolve,
  societyFound,
  societyRehire,
  societyRetire,
  societyTeach,
  societyTrain,
  societyUncrown,
} from "./society.js";

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
//  Instruction registry — keyed by "namespace.method"
// ================================================================

export const instructions: Record<string, InstructionDef> = {
  // society — individual lifecycle + org lifecycle
  "society.born": societyBorn,
  "society.retire": societyRetire,
  "society.die": societyDie,
  "society.rehire": societyRehire,
  "society.teach": societyTeach,
  "society.train": societyTrain,
  "society.found": societyFound,
  "society.dissolve": societyDissolve,

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
  "org.charter": orgCharter,
  "org.hire": orgHire,
  "org.fire": orgFire,
  "org.admin": orgAdmin,
  "org.unadmin": orgUnadmin,

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
  "project.maintain": projectMaintain,
  "project.unmaintain": projectUnmaintain,

  // product
  "product.strategy": productStrategy,
  "product.spec": productSpec,
  "product.release": productRelease,
  "product.channel": productChannel,
  "product.own": productOwn,
  "product.disown": productDisown,
  "product.deprecate": productDeprecate,

  // society — internal
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

export { def } from "./def.js";
