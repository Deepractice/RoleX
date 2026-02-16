/**
 * RoleX Concept World — all structure definitions.
 *
 * Every node is a Structure — simultaneously concept, container,
 * and information carrier. Tree (parent-child) provides the
 * hierarchical backbone. Relations provide cross-branch links.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │ society                                                 │
 * │ ├── individual          "A single agent in society"     │
 * │ │   ├── identity        "Who I am"                      │
 * │ │   │   ├── background  "My personal background"        │
 * │ │   │   ├── tone        "My tone of communication"      │
 * │ │   │   └── mindset     "How I think"                   │
 * │ │   ├── encounter       "A specific event I went through"│
 * │ │   ├── experience      "What I learned from encounters" │
 * │ │   ├── knowledge       "What I know"                   │
 * │ │   │   ├── principle   "My rules of conduct"           │
 * │ │   │   └── procedure   "My skill references and metadata"│
 * │ │   └── goal            "What I am pursuing"            │
 * │ │       └── plan        "How to achieve a goal"         │
 * │ │           └── task    "Concrete unit of work"         │
 * │ ├── organization        "A group of individuals"        │
 * │ │   │  ∿ membership → individual                        │
 * │ │   ├── charter         "The rules and mission"         │
 * │ │   └── position        "A role held by an individual"  │
 * │ │       │  ∿ appointment → individual                   │
 * │ │       └── duty        "Responsibilities of position"  │
 * │ └── past                "Things no longer active"        │
 * └─────────────────────────────────────────────────────────┘
 */
import { structure, relation } from "@rolexjs/system";

// ================================================================
//  Level 0 — Root
// ================================================================

export const society = structure("society", "The RoleX world", null);

// ================================================================
//  Level 1 — Three pillars
// ================================================================

export const individual = structure("individual", "A single agent in society", society);
export const organization = structure("organization", "A group of individuals", society, [
  relation("membership", "Who belongs to this organization", individual),
]);
export const past = structure("past", "Things no longer active", society);

// ================================================================
//  Individual — Identity
// ================================================================

export const identity = structure("identity", "Who I am", individual);
export const background = structure("background", "My personal background", identity);
export const tone = structure("tone", "My tone of communication", identity);
export const mindset = structure("mindset", "How I think and approach problems", identity);

// ================================================================
//  Individual — Cognition
// ================================================================

export const encounter = structure("encounter", "A specific event I went through", individual);
export const experience = structure("experience", "What I learned from encounters", individual);

// ================================================================
//  Individual — Knowledge
// ================================================================

export const knowledge = structure("knowledge", "What I know", individual);
export const principle = structure("principle", "My rules of conduct", knowledge);
export const procedure = structure("procedure", "My skill references and metadata", knowledge);

// ================================================================
//  Individual — Execution
// ================================================================

export const goal = structure("goal", "What I am pursuing", individual);
export const plan = structure("plan", "How to achieve a goal", goal);
export const task = structure("task", "Concrete unit of work", plan);

// ================================================================
//  Organization
// ================================================================

export const charter = structure("charter", "The rules and mission", organization);
export const position = structure("position", "A role held by an individual", organization, [
  relation("appointment", "Who holds this position", individual),
]);
export const duty = structure("duty", "Responsibilities of this position", position);
