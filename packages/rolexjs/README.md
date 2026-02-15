# rolexjs

Stateless API + Render layer for RoleX — the AI Agent Role Management Framework.

`rolexjs` is the integration layer that sits between core concept definitions and I/O adapters (MCP, CLI). It provides:

- **Rolex** class — stateless API with 24 operations
- **Render** functions — shared description & hint templates
- **Feature** types — Gherkin parse/serialize

## Install

```bash
bun add rolexjs
```

## Quick Start

```typescript
import { Rolex, describe, hint } from "rolexjs";
import { createGraphRuntime } from "@rolexjs/local-platform";

const rolex = new Rolex({ runtime: createGraphRuntime() });

// Born an individual
const result = rolex.born("Feature: I am Sean");
console.log(describe("born", "Sean", result.state));
// → Individual "Sean" is born.
console.log(hint("born"));
// → Next: hire into an organization, or activate to start working.
```

## Architecture

```
@rolexjs/system         →  primitives (Structure, State, Runtime)
@rolexjs/core           →  concept definitions (19 structures, 24 processes)
@rolexjs/parser         →  Gherkin parser (wraps @cucumber/gherkin)
rolexjs                 →  stateless API + render + Feature types  ← you are here
@rolexjs/local-platform →  graph-backed Runtime (graphology)
MCP / CLI               →  I/O adapters (state management, sessions)
```

## Stateless Design

Rolex is stateless. Every method takes explicit node references and returns a `RolexResult`. There is no name registry, no active role, no session — those are the I/O layer's responsibility.

```typescript
interface RolexResult {
  state: State;     // projection of the primary affected node
  process: string;  // which process was executed (for render)
}
```

The caller (MCP/CLI) holds references to nodes and passes them into each call.

## API Reference

### Constructor

```typescript
const rolex = new Rolex({ runtime: Runtime });
```

Creates a new Rolex instance. Bootstraps two root nodes:

- `rolex.society` — root of the world
- `rolex.past` — container for archived things

### Lifecycle — Creation

#### `born(source?: string): RolexResult`

Born an individual into society. Auto-scaffolds `identity` and `knowledge` sub-branches.

```typescript
const sean = rolex.born("Feature: I am Sean\n  As a backend architect...");
// sean.state.type === "individual"
// sean.state.children → [identity, knowledge]
```

#### `found(source?: string): RolexResult`

Found an organization.

```typescript
const org = rolex.found("Feature: Deepractice\n  A software company...");
```

#### `establish(org: Structure, source?: string): RolexResult`

Establish a position within an organization.

```typescript
const pos = rolex.establish(orgNode, "Feature: Architect\n  Technical leadership...");
```

#### `charter(org: Structure, source: string): RolexResult`

Define the charter (rules and mission) for an organization.

```typescript
rolex.charter(orgNode, "Feature: Company Charter\n  ...");
```

#### `charge(position: Structure, source: string): RolexResult`

Add a duty to a position.

```typescript
rolex.charge(posNode, "Feature: Code Review\n  Scenario: Review all PRs...");
```

### Lifecycle — Archival

All archival methods move the node to `past` and remove it from the active tree.

#### `retire(individual: Structure): RolexResult`

Retire an individual (can rehire later).

#### `die(individual: Structure): RolexResult`

An individual dies (permanent).

#### `dissolve(org: Structure): RolexResult`

Dissolve an organization.

#### `abolish(position: Structure): RolexResult`

Abolish a position.

#### `rehire(pastNode: Structure): RolexResult`

Rehire a retired individual from past. Creates a fresh individual with the same information.

```typescript
const retired = rolex.retire(seanNode);
// later...
const back = rolex.rehire(retiredNode);
```

### Organization — Membership & Appointment

These methods create/remove cross-branch **relations** (links between nodes that are not parent-child).

#### `hire(org: Structure, individual: Structure): RolexResult`

Link an individual to an organization via `membership`.

```typescript
rolex.hire(orgNode, seanNode);
```

#### `fire(org: Structure, individual: Structure): RolexResult`

Remove the membership link.

#### `appoint(position: Structure, individual: Structure): RolexResult`

Link an individual to a position via `appointment`.

```typescript
rolex.appoint(posNode, seanNode);
```

#### `dismiss(position: Structure, individual: Structure): RolexResult`

Remove the appointment link.

### Role — Activation

#### `activate(individual: Structure): RolexResult`

Pure projection — projects an individual's full state without mutation. Used to "load" a role.

```typescript
const role = rolex.activate(seanNode);
// role.state contains the full subtree + relations
```

### Execution — Goal Pursuit

#### `want(individual: Structure, source?: string): RolexResult`

Declare a goal under an individual.

```typescript
const goal = rolex.want(seanNode, "Feature: Build Auth System\n  ...");
```

#### `plan(goal: Structure, source?: string): RolexResult`

Create a plan for a goal.

```typescript
const p = rolex.plan(goalNode, "Feature: Auth Plan\n  Scenario: Phase 1...");
```

#### `todo(plan: Structure, source?: string): RolexResult`

Add a task to a plan.

```typescript
const t = rolex.todo(planNode, "Feature: Implement JWT\n  ...");
```

#### `finish(task: Structure, individual: Structure, experience?: string): RolexResult`

Finish a task. Removes the task and creates an `encounter` under the individual.

```typescript
rolex.finish(taskNode, seanNode, "Learned that JWT refresh is essential");
```

#### `achieve(goal: Structure, individual: Structure, experience?: string): RolexResult`

Achieve a goal. Removes the goal and creates an `encounter`.

#### `abandon(goal: Structure, individual: Structure, experience?: string): RolexResult`

Abandon a goal. Removes the goal and creates an `encounter`.

### Cognition — Learning

The cognition pipeline transforms raw encounters into structured knowledge:

```
encounter → reflect → experience → realize/master → principle/skill
```

#### `reflect(encounter: Structure, individual: Structure, source?: string): RolexResult`

Consume an encounter, create an `experience` under the individual.

#### `realize(experience: Structure, knowledge: Structure, source?: string): RolexResult`

Consume an experience, create a `principle` under knowledge.

#### `master(experience: Structure, knowledge: Structure, source?: string): RolexResult`

Consume an experience, create a `skill` under knowledge.

### Query

#### `project(node: Structure): State`

Project any node's full state (subtree + links). Returns `State` directly, not a `RolexResult`.

## Render

Standalone functions shared by MCP and CLI. The I/O layer just presents them.

### `describe(process, name, state): string`

What just happened — past tense description.

```typescript
describe("born", "Sean", state)    // → 'Individual "Sean" is born.'
describe("want", "Auth", state)    // → 'Goal "Auth" declared.'
describe("finish", "JWT", state)   // → 'Task "JWT" finished → encounter recorded.'
```

### `hint(process): string`

What to do next — suggestion prefixed with "Next: ".

```typescript
hint("born")     // → 'Next: hire into an organization, or activate to start working.'
hint("want")     // → 'Next: plan how to achieve it.'
hint("finish")   // → 'Next: continue with remaining tasks, or achieve the goal.'
```

## Feature (Gherkin)

Own types decoupled from `@cucumber/messages`. All `source` strings in Rolex are Gherkin Features.

### Types

```typescript
interface Feature {
  name: string;
  description?: string;
  tags?: string[];
  scenarios: Scenario[];
}

interface Scenario {
  name: string;
  description?: string;
  tags?: string[];
  steps: Step[];
}

interface Step {
  keyword: string;   // "Given ", "When ", "Then ", "And "
  text: string;
  dataTable?: DataTableRow[];
}

interface DataTableRow {
  cells: string[];
}
```

### `parse(source: string): Feature`

Parse a Gherkin source string into a Feature.

```typescript
import { parse } from "rolexjs";

const feature = parse(`
Feature: User Authentication
  As a user I want secure login

  Scenario: Login with email
    Given a registered user
    When they submit credentials
    Then they receive a token
`);

feature.name        // → "User Authentication"
feature.description // → "As a user I want secure login"
feature.scenarios   // → [{ name: "Login with email", steps: [...] }]
```

### `serialize(feature: Feature): string`

Serialize a Feature back to Gherkin source.

```typescript
import { serialize } from "rolexjs";

const source = serialize({
  name: "My Goal",
  scenarios: [{
    name: "Success",
    steps: [
      { keyword: "Given ", text: "the system is ready" },
      { keyword: "Then ", text: "it should work" },
    ],
  }],
});
// → "Feature: My Goal\n\n  Scenario: Success\n    Given the system is ready\n    Then it should work\n"
```

## Re-exports

`rolexjs` re-exports everything from `@rolexjs/core`:

```typescript
import {
  // Structure definitions
  society, individual, organization, past,
  identity, knowledge, goal, plan, task,
  encounter, experience, principle, skill,
  // ... and all process definitions
} from "rolexjs";
```

## Full Example

```typescript
import { Rolex, describe, hint } from "rolexjs";
import { createGraphRuntime } from "@rolexjs/local-platform";

const rolex = new Rolex({ runtime: createGraphRuntime() });

// 1. Born an individual
const { state: seanState } = rolex.born("Feature: I am Sean");
const seanNode = seanState.ref;  // caller tracks Structure references

// 2. Found org + establish position
const { state: orgState } = rolex.found("Feature: Deepractice");
const orgNode = orgState.ref;
const { state: posState } = rolex.establish(orgNode, "Feature: Architect");
const posNode = posState.ref;

// 3. Hire + appoint
rolex.hire(orgNode, seanNode);
rolex.appoint(posNode, seanNode);

// 4. Activate (pure projection)
const role = rolex.activate(seanNode);
console.log(describe("activate", "Sean", role.state));
// → Role "Sean" activated.
console.log(hint("activate"));
// → Next: want a goal, or check the current state.

// 5. Goal → plan → task
const { state: goalState } = rolex.want(seanNode, "Feature: Build Auth");
const goalNode = goalState.ref;
const { state: planState } = rolex.plan(goalNode, "Feature: Auth Plan");
const planNode = planState.ref;
const { state: taskState } = rolex.todo(planNode, "Feature: Implement JWT");
const taskNode = taskState.ref;

// 6. Finish → reflect → realize
const { state: encState } = rolex.finish(taskNode, seanNode, "JWT refresh is essential");
const encNode = encState.ref;
const { state: expState } = rolex.reflect(encNode, seanNode);
const expNode = expState.ref;
const knowledgeNode = /* sean's knowledge child */;
rolex.realize(expNode, knowledgeNode, "Always use refresh token rotation");
```

## License

MIT
