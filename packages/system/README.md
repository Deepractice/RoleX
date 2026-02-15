# @rolexjs/system

A concept world engine. Define concepts, build a tree, link them with relations — the world emerges.

This package provides the **rules** of the concept world. It is domain-agnostic — it knows nothing about roles, organizations, or AI agents. The upper layer's job is to **define concepts** and paint the world using these rules.

## The World

The world is a graph made of concepts.

Every node is a **Structure** — simultaneously three things:

- **Concept** — what it is (name + description)
- **Container** — can have child nodes
- **Information carrier** — can hold information (e.g. a Gherkin Feature text)

There is no special "container" type or "leaf" type. Every node is all three at once.

```
world
├── agent                          ← concept, also a container
│   ├── knowledge                  ← container (has children)
│   │   ├── pattern                ← information carrier
│   │   │      info: "Feature: ..."
│   │   └── procedure
│   │          info: "Feature: ..."
│   ├── experience                 ← information carrier (no children)
│   │      info: "Feature: I learned..."
│   └── experience                 ← OR a container (has children)
│       └── insight
│              info: "Feature: JWT lesson..."
└── org
    └── position ──relation──→ agent    ← cross-branch link
```

### Tree + Relations = Graph

- **Tree** (parent → child) provides the hierarchical backbone
- **Relations** provide cross-branch associations
- Together they form a graph

## Four Concepts

```
Structure   — the node          (what exists)
Relation    — the link          (how they connect)
Process     — the change        (how it evolves)
State       — the projection    (what you see)
```

### Structure

A Structure defines a type of node in the concept world.

```typescript
import { structure } from "@rolexjs/system";

// Root concept
const world = structure("world", "The concept world", null);

// Child concepts — parent defines where they live in the tree
const agent = structure("agent", "An agent identity", world);
const knowledge = structure("knowledge", "What I know", agent);
const experience = structure("experience", "What I learned", agent);
const insight = structure("insight", "A specific learning", experience);
```

The `parent` parameter establishes the tree backbone: `insight` lives under `experience`, which lives under `agent`, which lives under `world`.

### Relation

A Relation defines a cross-branch link type on a Structure.

```typescript
import { structure, relation } from "@rolexjs/system";

const agent = structure("agent", "An agent identity", world);
const org = structure("org", "An organization", world);

// position lives under org, and can link to agent
const position = structure("position", "A role in an organization", org, [
  relation("appointment", "The individual holding this position", agent),
]);
```

Relations are declared on the Structure definition as an array. A Structure can have multiple relations pointing to different concept types.

### Process

A Process defines how the world changes — a named composition of graph operations.

Five graph primitives:

| Primitive         | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `create(s)`       | Add a child node of structure type `s`               |
| `remove(s)`       | Delete a node of structure type `s` and its subtree  |
| `transform(a, b)` | Harvest from structure `a`, produce in structure `b` |
| `link(s, r)`      | Establish relation `r` on structure `s`              |
| `unlink(s, r)`    | Remove relation `r` on structure `s`                 |

```typescript
import { process, create, remove, transform, link, unlink } from "@rolexjs/system";

// Read-only process (no ops) — just projects state
const identity = process("identity", "Project full identity", agent);

// Create process — adds a new concept instance
const want = process("want", "Declare a goal", agent, create(goal));

// Transform process — converts one concept into another
const achieve = process("achieve", "Complete a goal", goal, transform(goal, insight));

// Link process — establishes a cross-branch relation
const appoint = process("appoint", "Assign to position", position, link(position, "appointment"));

// Unlink process — removes a cross-branch relation
const dismiss = process(
  "dismiss",
  "Remove from position",
  position,
  unlink(position, "appointment")
);
```

### State

A State is the projection of a node — a snapshot of its subtree and links.

```typescript
// State extends Structure, adding:
interface State extends Structure {
  children?: readonly State[]; // subtree
  links?: readonly { relation: string; target: State }[]; // cross-branch links
}
```

State is never stored — it is computed on demand via `runtime.project(node)`.

## Runtime

The Runtime is the execution engine. It operates on concept instances (nodes with `id`).

```typescript
import { createRuntime } from "@rolexjs/system";

const rt = createRuntime();

// Create instances
const root = rt.create(null, world);
const sean = rt.create(root, agent, "Feature: I am Sean...");
const dp = rt.create(root, org);
const arch = rt.create(dp, position);

// Link them
rt.link(arch, sean, "appointment");

// Project the state
const state = rt.project(root);
// → world
//   ├── agent (Sean)    info: "Feature: I am Sean..."
//   └── org
//       └── position
//             links: [{ relation: "appointment", target: agent(Sean) }]

// Unlink
rt.unlink(arch, sean, "appointment");

// Remove (cleans up subtree + all related links)
rt.remove(arch);
```

### Runtime API

| Method                             | Description                                          |
| ---------------------------------- | ---------------------------------------------------- |
| `create(parent, type, info?)`      | Create a node. `parent=null` for root.               |
| `remove(node)`                     | Remove a node, its subtree, and all related links.   |
| `transform(source, target, info?)` | Produce a new node in target's branch.               |
| `link(from, to, relation)`         | Establish a cross-branch relation. Idempotent.       |
| `unlink(from, to, relation)`       | Remove a cross-branch relation.                      |
| `project(node)`                    | Compute the current state of a node and its subtree. |

## Defining Your World

This package provides the rules. Your job is to define the concepts.

**Step 1: Define the concept tree** — what kinds of things exist and how they nest.

```typescript
const society = structure("society", "The world", null);
const individual = structure("individual", "An agent", society);
const persona = structure("persona", "Who I am", individual);
const goal = structure("goal", "What I pursue", individual);
const plan = structure("plan", "How to achieve it", goal);
const task = structure("task", "Concrete work", plan);
```

**Step 2: Define relations** — what connects across branches.

```typescript
const org = structure("organization", "A group", society);
const position = structure("position", "A role in the group", org, [
  relation("appointment", "Who holds this", individual),
]);
```

**Step 3: Define processes** — how the world changes.

```typescript
const want = process("want", "Declare a goal", individual, create(goal));
const design = process("design", "Plan for a goal", goal, create(plan));
const achieve = process("achieve", "Complete a goal", goal, transform(goal, conclusion));
const appoint = process("appoint", "Assign to position", position, link(position, "appointment"));
```

**Step 4: Run it** — create instances, link them, project state.

```typescript
const rt = createRuntime();
const world = rt.create(null, society);
const sean = rt.create(world, individual, "Feature: I am Sean...");
const myGoal = rt.create(sean, goal, "Feature: Build auth system...");
const myPlan = rt.create(myGoal, plan, "Feature: Auth plan...");
```

The rules are fixed. The world is yours to paint.

## Universal Formula

```
State = Process(Structure, Information?)
```

Everything reduces to this: a Process operates on a Structure (optionally with Information), and produces a State.

## Install

```bash
bun add @rolexjs/system
```
