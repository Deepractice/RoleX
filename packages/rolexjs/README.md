# rolexjs

Unified entry point for RoleX — the AI Agent Role Management Framework.

`rolexjs` re-exports everything from `@rolexjs/core` and adds the rendering layer. Install this one package to get the full API.

## Install

```bash
bun add rolexjs
```

## Quick Start

```typescript
import { createRoleX } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";

// Create RoleX instance
const rolex = await createRoleX(localPlatform({ dataDir: "./data" }));

// World-level: create an individual
await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });

// Activate — returns a stateful Role
const role = await rolex.activate("sean");

// Execution cycle
await role.want("Feature: Build Auth", "build-auth");
await role.plan("Feature: JWT Strategy", "jwt-plan");
await role.todo("Feature: Implement Login", "login");
await role.finish("login", "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success");

// Cognition cycle
await role.reflect(["login-finished"], "Feature: Token insight\n  Scenario: Learned\n    Given tokens\n    Then rotation matters", "token-insight");
await role.realize(["token-insight"], "Feature: Always rotate tokens\n  Scenario: Principle\n    Given short-lived tokens\n    Then refresh tokens are essential", "rotate-tokens");
```

## Architecture

```
@rolexjs/system         →  graph engine (Structure, State, Runtime)
@rolexjs/core           →  domain model (Role, RoleXService, Commands, structures, processes)
@rolexjs/parser         →  Gherkin parser
@rolexjs/genesis        →  bootstrap data
@rolexjs/local-platform →  filesystem persistence (SQLite + graphology)
rolexjs                 →  unified entry + rendering  ← you are here
```

## Core Concepts

### RoleX — World Entry Point

```typescript
const rolex = await createRoleX(platform);
```

Two methods:

- **`activate(id)`** — activate an individual, returns a stateful `Role`
- **`direct(locator, args)`** — execute world-level commands (`!individual.born`, `!org.found`, `!census.list`, etc.)

### Role — Rich Domain Model

Role is a self-contained operation domain for one individual. It holds state projection, cursors, and cognitive registries internally. All operations validate ownership — one individual's state never leaks to another.

```typescript
const role = await rolex.activate("sean");
```

#### Execution

| Method | Description |
|--------|-------------|
| `role.focus(goalId?)` | View or switch focused goal |
| `role.want(goal, id)` | Declare a goal |
| `role.plan(plan, id)` | Create a plan for the focused goal |
| `role.todo(task, id)` | Add a task to the focused plan |
| `role.finish(taskId, encounter?)` | Complete a task, optionally record encounter |
| `role.complete(planId?, encounter?)` | Close a plan as done |
| `role.abandon(planId?, encounter?)` | Drop a plan |

#### Cognition

| Method | Description |
|--------|-------------|
| `role.reflect(encounterIds, experience?, id?)` | Consume encounters → experience |
| `role.realize(experienceIds, principle?, id?)` | Consume experiences → principle |
| `role.master(procedure, id?, experienceIds?)` | Create procedure, optionally consuming experiences |

#### Knowledge & Skills

| Method | Description |
|--------|-------------|
| `role.forget(nodeId)` | Remove a node under this individual |
| `role.skill(locator)` | Load full skill content by locator |
| `role.use(locator, args?)` | Subjective execution — `!ns.method` or ResourceX |

#### State

| Method | Description |
|--------|-------------|
| `role.project()` | Render the individual's full state tree |
| `role.snapshot()` | Serialize cursors + cognitive state (KV-compatible) |
| `role.restore(snapshot)` | Restore from a snapshot |

### Ownership Isolation

Role validates that every operation targets nodes belonging to its own individual:

```typescript
const sean = await rolex.activate("sean");
const nuwa = await rolex.activate("nuwa");

await sean.want("Feature: Auth", "auth");
await nuwa.focus("auth"); // throws: Goal "auth" does not belong to individual "nuwa"
```

### World-Level Commands

Commands executed via `rolex.direct()`:

```typescript
// Individuals
await rolex.direct("!individual.born", { content: "Feature: Sean", id: "sean" });
await rolex.direct("!individual.retire", { individual: "sean" });

// Organizations
await rolex.direct("!org.found", { content: "Feature: Deepractice", id: "dp" });
await rolex.direct("!org.hire", { organization: "dp", individual: "sean" });

// Positions
await rolex.direct("!position.establish", { organization: "dp", content: "Feature: CTO", id: "cto" });
await rolex.direct("!position.appoint", { position: "cto", individual: "sean" });

// Census
const census = await rolex.direct("!census.list");
```

## Gherkin

All content in RoleX is expressed as Gherkin Feature files.

```typescript
import { parse, serialize } from "rolexjs";

const feature = parse(`
Feature: User Authentication
  Scenario: Login with email
    Given a registered user
    When they submit credentials
    Then they receive a token
`);

const source = serialize(feature);
```

## Rendering

rolexjs provides rendering functions for command results:

```typescript
import { render, describe, hint, renderState } from "rolexjs";

// 3-layer output: status + hint + projection
const output = render({ process: "born", name: "Sean", state: result.state });

// Individual layers
describe("born", "Sean", state);  // → 'Individual "Sean" is born.'
hint("born");                      // → 'Next: hire into an organization...'
renderState(state);                // → Markdown projection of the state tree
```

## License

MIT
