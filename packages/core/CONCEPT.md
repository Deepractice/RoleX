# RoleX Concept World

This document defines the concept world of RoleX — every concept, its rationale, and the principles behind it.

## Principles

### 1. Sociology-grounded

All concept names come from **human sociology**, not technical jargon. The core theory of RoleX is transferring human social experience to AI. Every term must be commonly used and understood in human society.

### 2. A priori — instant activation

Every concept must be **a priori** — the word itself carries a consensus meaning. No explanation needed, no ambiguity. If a word requires a custom definition to be understood, it is the wrong word.

The naming goal: **use the shortest word that instantly activates AI's cognition of the concept.** One word should be enough for AI to know exactly what it means — no further explanation, no custom definition. The word itself is the definition.

### 3. Three-in-one

Every node (Structure) is simultaneously:

- **Concept** — what it is (name + description)
- **Container** — can have child nodes
- **Information carrier** — can hold information

There is no special "container" type or "leaf" type.

### 4. Top-down definition

Concepts are defined from root to leaves, one layer at a time. Each concept is reviewed and approved before proceeding deeper.

---

## Concept Tree

### Level 0 — Root

```
society                 "The RoleX world"               parent: null
```

The root of the entire concept world. All concepts exist within society.

Why "society" and not "world": "world" includes the natural world. This system is purely a **concept world** — social constructs, not natural phenomena.

### Level 1 — Two pillars

```
society
├── individual          "A single agent in society"     parent: society
├── organization        "A group of individuals"        parent: society
└── past                "Things no longer active"       parent: society
```

The two fundamental entities in any society: individuals and organizations. **past** holds everything that is no longer active — retired individuals, dissolved organizations, abolished positions. No real deletion — just transform into past.

### Level 2 — Individual

```
individual
├── identity            "Who I am"                         parent: individual
│   ├── background      "My personal background"           parent: identity
│   ├── tone            "My tone of communication"         parent: identity
│   └── mindset         "How I think and approach problems" parent: identity
├── encounter           "A specific event I went through"  parent: individual
├── experience          "What I learned from encounters"   parent: individual
├── knowledge           "What I know"                      parent: individual
│   ├── principle       "My rules of conduct"              parent: knowledge
│   └── skill           "My abilities and how-to"          parent: knowledge
└── goal                "What I am pursuing"               parent: individual
    └── plan            "How to achieve a goal"            parent: goal
        └── task        "Concrete unit of work"            parent: plan
```

**identity** — who I am. Replaces ~~persona~~ (persona means "social mask/facade", not the true self).

**encounter → experience → knowledge** — three stages of cognition, connected by transform processes, not by parent-child.

### Level 2 — Organization

```
organization            "A group of individuals"        parent: society
│  relation: membership → individual
├── charter             "The rules and mission"         parent: organization
└── position            "A role held by an individual"  parent: organization
    │  relation: appointment → individual
    └── duty            "Responsibilities of this position"  parent: position
```

**organization** has two relations:

- **membership** — who belongs to this organization (hire/fire)
- **appointment** (on position) — who holds a specific role (appoint/dismiss)

Organization supports self-nesting. A sub-organization is just an organization instance under another organization instance. No new concept needed — a department is still an organization.

```
(Deepractice)                    ← organization instance
│  membership → (Sean)              ← Sean is a member
│  membership → (Alice)             ← Alice is a member
├── (Engineering)                ← organization instance (sub-org)
│   └── (Architect)              ← position instance
│          appointment → (Sean)     ← Sean holds this position
└── (Marketing)                  ← organization instance (sub-org)
```

- **"Who is in the org"** is answered by membership relation.
- **"Where in the org"** is answered by the tree: position under Engineering, Engineering under Deepractice.
- **"Who holds a position"** is answered by appointment relation.

---

## Processes (Verbs)

Processes define how the concept world changes. Each process targets a structure and performs zero or more graph operations.

| Process   | Description                                    | Target       | Ops                                | Notes                                                       |
| --------- | ---------------------------------------------- | ------------ | ---------------------------------- | ----------------------------------------------------------- |
| activate  | Activate a role — load cognition into context  | individual   | (none — read/projection)           | What to load is defined by upper layer                      |
| want      | Declare a goal                                 | individual   | create(goal)                       | "I want to..." — natural intent expression                  |
| plan      | Create a plan for a goal                       | goal         | create(plan)                       | Noun-verb unity. Replaces "design"                          |
| todo      | Create a task in a plan                        | plan         | create(task)                       | Colloquial, personal — like adding to your own list         |
| finish    | Complete a task, record as encounter           | task         | transform(task, encounter)         | Task consumed, becomes an encounter with execution record   |
| achieve   | Complete a goal, record as encounter           | goal         | transform(goal, encounter)         | Goal consumed, becomes an encounter                         |
| abandon   | Abandon a goal, record as encounter            | goal         | transform(goal, encounter)         | Giving up is also an encounter worth recording              |
| reflect   | Reflect on encounters, distill into experience | encounter    | transform(encounter, experience)   | "Reflect on what happened" — unhurried consideration        |
| realize   | Realize a principle from experience            | experience   | transform(experience, principle)   | "I realized a principle" — personal, introspective          |
| master    | Master a skill from experience                 | experience   | transform(experience, skill)       | "I mastered this skill" — personal, earned through practice |
| hire      | Hire an individual into the organization       | organization | link(organization, "membership")   | "You're hired"                                              |
| fire      | Fire an individual from the organization       | organization | unlink(organization, "membership") | "You're fired"                                              |
| appoint   | Appoint a member to a position                 | position     | link(position, "appointment")      | "Appoint someone to a role"                                 |
| dismiss   | Dismiss from a position                        | position     | unlink(position, "appointment")    | "Dismissed from the position"                               |
| born      | An individual is born into society             | society      | create(individual)                 | Society-level creation                                      |
| found     | Found an organization                          | society      | create(organization)               | "Found a company"                                           |
| establish | Establish a position in an organization        | organization | create(position)                   | "Establish a role"                                          |
| charter   | Define the charter for an organization         | organization | create(charter)                    | Noun-verb unity                                             |
| charge    | Add a duty to a position                       | position     | create(duty)                       | "Charge with duties"                                        |
| retire    | Retire an individual                           | individual   | transform(individual, past)        | Moves to past, can be rehired                               |
| die       | An individual dies                             | individual   | transform(individual, past)        | Permanent — cannot rehire                                   |
| dissolve  | Dissolve an organization                       | organization | transform(organization, past)      | Org moves to past                                           |
| abolish   | Abolish a position                             | position     | transform(position, past)          | Position moves to past                                      |
| rehire    | Rehire a retired individual                    | past         | transform(past, individual)        | Bring back from past                                        |

---

## Review Log

| Concept      | Status   | Notes                                                                                           |
| ------------ | -------- | ----------------------------------------------------------------------------------------------- |
| society      | approved | Root. Not "world" — this is a concept world, not natural world.                                 |
| individual   | approved | Single agent. Not "agent" (too technical).                                                      |
| organization | approved | Group of individuals.                                                                           |
| identity     | approved | Replaces "persona". Container for who I am: background, tone, mindset.                          |
| background   | approved | Under identity. Replaces "memoir". Instant activation: "what's your background?"                |
| tone         | approved | Under identity. Replaces "voice". Instant activation: communication tone and attitude.          |
| mindset      | approved | Under identity. Replaces "philosophy". Instant activation: thinking patterns, mental model.     |
| encounter    | approved | Under individual. Raw event, what happened. Transform → experience.                             |
| experience   | approved | Under individual. Refined understanding from encounters. Transform → knowledge.                 |
| knowledge    | approved | Under individual. "What I know" — zero ambiguity.                                               |
| principle    | approved | Under knowledge. Replaces "pattern". Instant activation: fundamental rules and truths.          |
| skill        | approved | Under knowledge. Replaces "procedure". Instant activation: abilities and how-to.                |
| ~~theory~~   | removed  | Objective knowledge about the world — not personal. Individual only keeps subjective knowledge. |
| goal         | approved | Under individual. "What I am pursuing" — zero ambiguity.                                        |
| plan         | approved | Under goal. "How to achieve it" — zero ambiguity.                                               |
| task         | approved | Under plan. "Concrete unit of work" — zero ambiguity.                                           |
| position     | approved | Under organization. With relation "appointment" → individual.                                   |
| membership   | approved | Relation on organization → individual. Tracks who belongs.                                      |
| past         | approved | Under society. Container for all inactive things. No real deletion.                             |
| charter      | approved | Under organization. Rules and mission of the org.                                               |
| duty         | approved | Under position. Responsibilities of the position.                                               |
