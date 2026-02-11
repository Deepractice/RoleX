# @rolexjs/system

Systems Theory meta-model and runtime. Domain-agnostic — knows nothing about roles, Gherkin, or AI agents.

## Six Concepts

A system is described by six concepts:

```
Information  — what exists (content categories)
Structure    — where it lives (containers)
Relation     — how they connect (links between structures)
State        — what it looks like now (snapshot frames)
Process      — how it changes (the only way information moves)
System       — why it loops (processes forming a closed cycle)
```

### Information

The fundamental element. Immutable and accumulative — added, never mutated.

```typescript
import type { InformationType } from "@rolexjs/system";

const GOAL: InformationType = {
  type: "goal",
  description: "A desired outcome.",
  belongsTo: "Role",
  children: ["plan"],  // containment hierarchy
};
```

`children` declares what types are nested inside this type. When a parent is consumed, children cascade.

### Structure

A container that holds information. Its state is derived, not stored.

```typescript
import type { StructureDefinition } from "@rolexjs/system";

const ROLE: StructureDefinition = {
  name: "Role",
  description: "An identity that accumulates knowledge and pursues goals.",
  informationTypes: ["persona", "goal", "knowledge.pattern", "experience.insight"],
};
```

### Relation

A link between structures. Gives the system its topology.

```typescript
import type { RelationDefinition } from "@rolexjs/system";

const MEMBERSHIP: RelationDefinition = {
  name: "membership",
  description: "A role belongs to an organization.",
  from: "Role",
  to: "Organization",
  cardinality: "many-to-many",
};
```

### State

A snapshot frame produced by a query process. Not stored — computed on demand.

```typescript
import type { StateDefinition } from "@rolexjs/system";

const COGNITION: StateDefinition = {
  name: "cognition",
  description: "Everything the role knows about itself.",
  appliesTo: "Role",
  producedBy: "identity",
  includes: ["persona", "knowledge.pattern", "knowledge.procedure"],
};
```

### Process

The only way information changes. Categorized by kind:

| Kind | What it does |
|------|-------------|
| `create` | Brings a new structure into existence |
| `write` | Adds information to an existing structure |
| `transform` | Converts one information type into another |
| `relate` | Establishes or removes a relationship |
| `query` | Reads without changing anything |

```typescript
import type { ProcessDefinition } from "@rolexjs/system";

const ACHIEVE: ProcessDefinition = {
  name: "achieve",
  description: "Mark a goal as achieved and distill experience.",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience.insight"],
  consumes: ["goal"],  // removed from active state
};
```

**`inputs`** — what the process reads.
**`outputs`** — what the process produces.
**`consumes`** — what the process removes from active state. Consumed nodes cascade along `children`.

### System

A closed loop of processes. Output feeds back as input for the next cycle.

```typescript
import type { SystemDefinition } from "@rolexjs/system";

const INDIVIDUAL: SystemDefinition = {
  name: "individual",
  description: "A role's first-person cognitive lifecycle.",
  processes: ["want", "design", "todo", "finish", "achieve", "reflect", "contemplate"],
  feedback: ["knowledge.pattern", "knowledge.theory"],
};
```

## Runtime

`defineSystem()` turns declarations into a runnable graph-based system.

### Platform

Storage abstraction. Graph topology in memory, content on demand.

```typescript
import type { Platform } from "@rolexjs/system";

// Platform<I> is generic — I is the content type (e.g. Gherkin Feature)
// Implementors provide: loadGraph, saveGraph, writeContent, readContent, removeContent
```

### GraphModel

In-memory topology with consume support.

```typescript
import type { GraphModel } from "@rolexjs/system";

// Key operations:
// addNode, getNode, updateNode, hasNode, dropNode, findNodes
// relate, relateTo, unrelate
// consume(key, cascade?) — mark node as consumed (removed from active state)
// restore(key) — undo consumption
// export() / import() — serialization
```

### defineSystem

```typescript
import { defineSystem } from "@rolexjs/system";
import type { Process } from "@rolexjs/system";

// 1. Define executable processes (extend ProcessDefinition with params + execute)
const achieve: Process<AchieveParams, Feature> = {
  name: "achieve",
  kind: "write",
  targets: ["Role"],
  inputs: ["goal"],
  outputs: ["experience.insight"],
  consumes: ["goal"],
  params: achieveSchema,  // zod schema for validation
  execute(ctx, params) {
    // ctx.graph — topology
    // ctx.platform — content storage
    // ctx.structure — current structure name
    return "achieved";
  },
};

// 2. Create the runnable system
const system = defineSystem(graph, platform, {
  name: "individual",
  processes: { achieve, finish, want /* ... */ },
});

// 3. Execute processes
await system.execute("achieve", { experience: { name: "...", source: "..." } });
// Graph is auto-persisted after every execute via platform.saveGraph()
```

### ProcessContext

Every process receives a context:

```typescript
interface ProcessContext<I> {
  readonly graph: GraphModel;       // topology (in memory)
  readonly platform: Platform<I>;   // content (on demand)
  structure: string;                // current structure name
  readonly locale: string;          // from platform settings
}
```

## Design Principles

1. **Domain-agnostic** — the system layer knows nothing about roles, Gherkin, or AI. It defines how any system works.
2. **Declarative first** — six concepts describe what the system IS. Runtime makes it executable.
3. **Graph + Content separation** — topology is lightweight and in-memory. Content is heavy and loaded on demand.
4. **Consume, not delete** — consumed information is logically removed from the graph but not physically deleted. Platform handles physical cleanup.
5. **Auto-persist** — `defineSystem()` saves graph after every process execution. No manual save needed.
