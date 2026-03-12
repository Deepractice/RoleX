<div align="center">
  <h1>RoleX</h1>
  <p>
    <strong>Social Framework for AI Agents</strong>
  </p>
  <p>AI 智能体社会化框架</p>
  <p><em>Give AI agents persistent identity, social structure, and growth through experience — modeled on how human societies work.</em></p>

  <p>
    <a href="https://github.com/Deepractice/RoleX"><img src="https://img.shields.io/github/stars/Deepractice/RoleX?style=social" alt="Stars"/></a>
    <img src="https://visitor-badge.laobi.icu/badge?page_id=Deepractice.RoleX" alt="Views"/>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Deepractice/RoleX?color=blue" alt="License"/></a>
    <a href="https://www.npmjs.com/package/rolexjs"><img src="https://img.shields.io/npm/v/rolexjs?color=cb3837&logo=npm" alt="npm"/></a>
  </p>

  <p>
    <a href="README.md"><strong>English</strong></a> |
    <a href="README.zh-CN.md">简体中文</a>
  </p>
</div>

---

## Why Social?

Human societies solve a problem AI agents haven't: **how to organize, grow, and persist**.

In a society, people have identities, join organizations, hold positions, accumulate experience, and pass on knowledge. RoleX brings this same model to AI agents:

- **Identity** — An agent knows who it is across sessions, not just within one
- **Organization** — Agents belong to groups, hold positions, carry duties
- **Growth** — Experience accumulates into principles and reusable skills
- **Persistence** — Goals, plans, and knowledge survive beyond a single conversation

Everything is expressed in **Gherkin** `.feature` format — human-readable, structured, versionable.

## Quick Start — MCP

Install the MCP server, connect it to your AI client, and say **"activate nuwa"** — she will guide you from there.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "rolex": {
      "command": "npx",
      "args": ["-y", "@rolexjs/mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "rolex": {
      "command": "npx",
      "args": ["-y", "@rolexjs/mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><b>VS Code</b></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "rolex": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@rolexjs/mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "rolex": {
      "command": "npx",
      "args": ["-y", "@rolexjs/mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><b>JetBrains IDEs</b></summary>

Go to **Settings > Tools > AI Assistant > Model Context Protocol (MCP)**, click **+** and paste:

```json
{
  "mcpServers": {
    "rolex": {
      "command": "npx",
      "args": ["-y", "@rolexjs/mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><b>Zed</b></summary>

Add to Zed's `settings.json`:

```json
{
  "context_servers": {
    "rolex": {
      "command": {
        "path": "npx",
        "args": ["-y", "@rolexjs/mcp-server"]
      }
    }
  }
}
```

</details>

## Quick Start — API

For building your own agent runtime, CLI, or platform integration:

```bash
npm install rolexjs @rolexjs/local-platform
```

```typescript
import { createRoleX } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";

// Create — synchronous, initialization is lazy
const rx = createRoleX({ platform: localPlatform() });

// Activate a role
const role = await rx.role.activate({ individual: "nuwa" });

// Typed namespace API — 9 namespaces
await rx.society.born({ id: "alice", content: "Feature: Alice\n  A frontend engineer." });
await rx.org.hire({ org: "deepractice", individual: "alice" });
await rx.position.appoint({ position: "frontend-lead", individual: "alice" });

// Role operations — goals, plans, tasks, cognition
await role.want("Feature: Ship v2\n  Scenario: Launch\n    Given all tests pass", "ship-v2");
await role.plan("Feature: Phase 1\n  Scenario: Setup CI", "setup-ci");
await role.todo("Feature: Add lint step\n  Scenario: Biome runs on PR", "add-lint");
await role.finish("add-lint");

// JSON-RPC 2.0 — universal dispatch
const response = await rx.rpc({
  jsonrpc: "2.0",
  method: "society.born",
  params: { id: "bob", content: "Feature: Bob" },
  id: 1,
});

// Protocol — tool schemas + world instructions for any channel adapter
const { tools, instructions } = rx.protocol;
// tools[0] = { name: "activate", description: "...", params: { ... } }
```

### Builder API

`createRoleX()` returns a `RoleXBuilder` — a synchronous builder with lazy initialization. The first async call triggers init (genesis prototype, world bootstrap).

**9 typed namespaces:**

| Namespace | Purpose |
|-----------|---------|
| `rx.society` | Individuals & organizations — born, retire, teach, train, found, dissolve |
| `rx.org` | Membership & governance — charter, hire, fire, establish, abolish |
| `rx.position` | Roles & duties — charge, require, appoint, dismiss |
| `rx.project` | Project management — scope, milestone, deliver, wiki |
| `rx.product` | Product lifecycle — strategy, spec, release, channel |
| `rx.survey` | World queries — list all entities |
| `rx.issue` | Issue tracking — publish, comment, assign, label |
| `rx.resource` | Resource management — add, push, pull, search |
| `rx.role` | Role operations — activate, inspect, survey |

**Universal dispatch:**

```typescript
// JSON-RPC 2.0 — same format works locally or over the wire
await rx.rpc({ jsonrpc: "2.0", method: "org.hire", params: { org: "acme", individual: "alice" }, id: 1 });
```

**Protocol — self-describing tool schemas:**

```typescript
// Build any channel adapter (MCP, REST, CLI, A2A) from rx.protocol
for (const tool of rx.protocol.tools) {
  register(tool.name, tool.description, tool.params);
}
```

## How It Works

### The Doing Cycle

An activated agent pursues goals through a structured lifecycle:

```
activate → want → plan → todo → finish → complete / abandon
```

Goals are declared with `want`, broken into plans with `plan`, and executed as tasks with `todo`. Finishing a task creates an **encounter** — a raw record of what happened.

### The Learning Cycle

Encounters feed the cognition system:

```
encounter → reflect → experience → realize / master → principle / procedure
```

`reflect` digests encounters into experience. `realize` distills experience into transferable **principles**. `master` codifies experience into reusable **procedures** (skills). This is how agents grow — knowledge from one project applies to the next.

### Skills — Progressive Disclosure

Agents can't load every skill into context at once. RoleX uses three layers:

| Layer | Loaded when | Contains |
|-------|-------------|----------|
| **Procedure** | Always (at activate) | Metadata — what the skill is, when to use it |
| **Skill** | On demand via `skill(locator)` | Full instructions — how to do it |
| **Resource** | On demand via `use(locator)` | External content — templates, data, tools |

### Gherkin — The Universal Language

Everything in RoleX is expressed as Gherkin Features — goals, plans, tasks, principles, procedures, encounters, experiences. Human-readable, structured, composable.

```gherkin
Feature: Sean
  A backend architect who builds AI agent frameworks.

  Scenario: Background
    Given I am a software engineer
    And I specialize in systems design
```

## Storage

RoleX persists everything in a single SQLite database at `~/.deepractice/rolex/rolex.db`.

## Packages

| Package | Description |
|---------|-------------|
| `rolexjs` | Main entry — builder API, namespaces, rendering, genesis built-in |
| `@rolexjs/mcp-server` | MCP server for AI clients |
| `@rolexjs/core` | Core types, commands, JSON-RPC, protocol schema |
| `@rolexjs/genesis` | Foundational world prototype (Nuwa sovereign) |
| `@rolexjs/system` | Runtime interface, state merging |
| `@rolexjs/parser` | Gherkin parser |
| `@rolexjs/local-platform` | SQLite-backed platform implementation |

---

<div align="center">
  <h3>Ecosystem</h3>
  <p>Part of the <a href="https://github.com/Deepractice">Deepractice</a> AI Agent infrastructure:</p>
  <p>
    <a href="https://github.com/Deepractice/ResourceX"><strong>ResourceX</strong></a> &middot;
    <a href="https://github.com/Deepractice/RoleX"><strong>RoleX</strong></a> &middot;
    <a href="https://github.com/Deepractice/CommonX"><strong>CommonX</strong></a>
  </p>
</div>

---

<div align="center">
  <p>MIT License &copy; <a href="https://github.com/Deepractice">Deepractice</a></p>
</div>
