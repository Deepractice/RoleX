# rolexjs

Unified entry point for RoleX — the Social Framework for AI Agents.

`rolexjs` re-exports everything from `@rolexjs/core` and adds the rendering layer + genesis bootstrap. Install this one package to get the full API.

## Install

```bash
bun add rolexjs @rolexjs/local-platform
```

## Quick Start

```typescript
import { createRoleX } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";

// Create — synchronous, initialization is lazy
const rx = createRoleX({ platform: localPlatform() });

// Activate an individual — returns a stateful Role
const role = await rx.individual.activate({ individual: "sean" });

// Execution cycle
await role.want("Feature: Build Auth", "build-auth");
await role.plan("Feature: JWT Strategy", "jwt-plan");
await role.todo("Feature: Implement Login", "login");
await role.finish("login", "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success");

// Cognition cycle
await role.reflect(["login-finished"], "Feature: Token insight\n  Scenario: Learned\n    Given tokens\n    Then rotation matters", "token-insight");
await role.realize(["token-insight"], "Feature: Always rotate tokens\n  Scenario: Principle\n    Given short-lived tokens\n    Then refresh tokens are essential", "rotate-tokens");
```

## Builder API

`createRoleX()` returns a `RoleXBuilder` — a synchronous builder with lazy initialization. The first async call triggers init (genesis prototype, world bootstrap).

### Namespaces

```typescript
// Individual
const role = await rx.individual.activate({ individual: "sean" });

// Society — individuals & organizations
await rx.society.born({ id: "alice", content: "Feature: Alice" });
await rx.society.found({ id: "dp", content: "Feature: Deepractice" });

// Organization — membership & governance
await rx.org.hire({ org: "dp", individual: "alice" });
await rx.org.establish({ id: "cto", content: "Feature: CTO" });

// Position — roles & duties
await rx.position.appoint({ position: "cto", individual: "alice" });
await rx.position.charge({ position: "cto", content: "Feature: Lead engineering", id: "lead-eng" });

// Project — project management
await rx.org.launch({ id: "rolex", content: "Feature: RoleX" });

// Product — product lifecycle
// Issue — issue tracking
// Resource — resource management
```

### World-Level Observation

```typescript
// Inspect any node's full state
const state = await rx.inspect({ id: "sean" });

// Survey the world — list entities
const overview = await rx.survey({ type: "individual" });
```

### Universal Dispatch

```typescript
// JSON-RPC 2.0 — same format works locally or over the wire
const response = await rx.rpc({
  jsonrpc: "2.0",
  method: "org.hire",
  params: { org: "acme", individual: "alice" },
  id: 1,
});
```

### Protocol — Self-Describing Schema

```typescript
// Build any channel adapter (MCP, REST, CLI, A2A) from rx.protocol
const { tools, instructions } = rx.protocol;
for (const tool of tools) {
  register(tool.name, tool.description, tool.params);
}
```

## Role API

Role is a self-contained operation domain for one individual. It holds state projection, cursors, and cognitive registries internally. All operations validate ownership — one individual's state never leaks to another.

### Execution

| Method | Description |
|--------|-------------|
| `role.focus(goalId?)` | View or switch focused goal |
| `role.want(goal, id)` | Declare a goal |
| `role.plan(plan, id)` | Create a plan for the focused goal |
| `role.todo(task, id)` | Add a task to the focused plan |
| `role.finish(taskId, encounter?)` | Complete a task, optionally record encounter |
| `role.complete(planId?, encounter?)` | Close a plan as done |
| `role.abandon(planId?, encounter?)` | Drop a plan |

### Cognition

| Method | Description |
|--------|-------------|
| `role.reflect(encounterIds, experience?, id?)` | Consume encounters into experience |
| `role.realize(experienceIds, principle?, id?)` | Consume experiences into principle |
| `role.master(procedure, id?, experienceIds?)` | Create procedure, optionally consuming experiences |

### Knowledge & Skills

| Method | Description |
|--------|-------------|
| `role.forget(nodeId)` | Remove a node under this individual |
| `role.skill(locator)` | Load full skill content by locator |
| `role.use(locator, args?)` | Subjective execution — `!ns.method` or ResourceX |

### State

| Method | Description |
|--------|-------------|
| `role.project()` | Render the individual's full state tree |
| `role.snapshot()` | Serialize cursors + cognitive state |
| `role.restore(snapshot)` | Restore from a snapshot |

### Ownership Isolation

```typescript
const sean = await rx.individual.activate({ individual: "sean" });
const nuwa = await rx.individual.activate({ individual: "nuwa" });

await sean.want("Feature: Auth", "auth");
await nuwa.focus("auth"); // throws: Goal "auth" does not belong to individual "nuwa"
```

## Architecture

```
@rolexjs/system         →  graph engine (Structure, State, Runtime)
@rolexjs/core           →  domain model (Role, RoleXService, Commands, structures, processes)
@rolexjs/parser         →  Gherkin parser
@rolexjs/genesis        →  bootstrap data
@rolexjs/local-platform →  filesystem persistence (SQLite + graphology)
rolexjs                 →  unified entry + rendering + genesis  ← you are here
```

## License

MIT
