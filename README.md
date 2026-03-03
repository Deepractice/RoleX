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

## Quick Start

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

## How It Works

**You don't need to learn any commands.** Just install the MCP server and talk to your AI naturally — "create an organization", "set a goal", "what have I learned?". The AI knows which tools to call.

Everything below is what happens **under the hood**. RoleX provides MCP tools that the AI calls autonomously. Understanding the mechanism helps you get more out of it, but operating it is the AI's job, not yours.

The tools fall into two categories:

- **Direct tools** — the AI calls them by name (e.g. `activate`, `want`, `plan`). These are daily operations.
- **The `use` tool** — a unified dispatch for world management, written as `!namespace.method` (e.g. `!org.found`, `!census.list`). This is the admin layer.

The following sections walk through each system in the order an agent encounters them.

---

### 1. The World — Society Structure

Before an agent can act, a world must exist. RoleX models a **society** with four entity types:

```
Society
├── Individual      # An agent with identity, goals, and knowledge
├── Organization    # Groups individuals via membership
├── Position        # Defines roles with duties and required skills
└── Past            # Archive for retired/dissolved entities
```

All world management goes through the `use` tool:

**Individual** — agent lifecycle

| Command | What it does |
|---------|-------------|
| `!individual.born` | Create an individual |
| `!individual.teach` | Inject a principle (knowledge) |
| `!individual.train` | Inject a procedure (skill) |
| `!individual.retire` | Archive an individual |

**Organization** — group structure

| Command | What it does |
|---------|-------------|
| `!org.found` | Create an organization |
| `!org.charter` | Define mission and governance |
| `!org.hire` / `!org.fire` | Add or remove members |
| `!org.dissolve` | Archive an organization |

**Position** — roles and responsibilities

| Command | What it does |
|---------|-------------|
| `!position.establish` | Create a position |
| `!position.charge` | Assign a duty |
| `!position.require` | Declare a required skill — auto-trained on appointment |
| `!position.appoint` / `!position.dismiss` | Assign or remove an individual |
| `!position.abolish` | Archive a position |

**Census** — query the world

| Command | What it does |
|---------|-------------|
| `!census.list` | List all individuals, organizations, positions |
| `!census.list { type: "..." }` | Filter by type: `individual`, `organization`, `position`, `past` |

---

### 2. Execution — The Doing Cycle

Once activated, an agent pursues goals through a structured lifecycle. These are **direct tools** the agent calls by name:

```
activate → want → plan → todo → finish → complete / abandon
```

| Tool | What it does |
|------|-------------|
| `activate` | Enter a role — load identity, goals, knowledge |
| `focus` | View or switch the current goal |
| `want` | Declare a goal with success criteria |
| `plan` | Break a goal into phases (supports sequential and fallback strategies) |
| `todo` | Create a concrete task under a plan |
| `finish` | Mark a task done, optionally record what happened |
| `complete` | Mark a plan done — strategy succeeded |
| `abandon` | Drop a plan — strategy failed, but learning is captured |

---

### 3. Cognition — The Learning Cycle

Execution produces **encounters** — raw records of what happened. The cognition system transforms these into structured knowledge. These are also **direct tools**:

```
encounter → reflect → experience → realize / master → principle / procedure
```

| Tool | What it does |
|------|-------------|
| `reflect` | Digest encounters into experience — pattern recognition |
| `realize` | Distill experience into a principle — a transferable truth |
| `master` | Distill experience into a procedure — a reusable skill |
| `forget` | Remove outdated knowledge |

This is how an agent grows. A principle learned from one project applies to the next. A procedure mastered once can be reused forever.

---

### 4. Skills — Progressive Disclosure

An agent can't load every skill into context at once. RoleX uses a three-layer progressive disclosure model:

| Layer | Loaded when | What it contains |
|-------|-------------|-----------------|
| **Procedure** | Always (at activate) | Metadata — what the skill is, when to use it |
| **Skill** | On demand via `skill(locator)` | Full instructions — step-by-step how to do it |
| **Resource** | On demand via `use(locator)` | External content — templates, data, tools |

The `skill` and `use` tools are **direct tools** for loading content. When `use` receives a locator *without* the `!` prefix, it loads a resource from [ResourceX](https://github.com/Deepractice/ResourceX) instead of dispatching a command.

---

### 5. Resources — Agent Capital

Resources are the **means of production** for AI agents — skills, prototypes, and knowledge packages that can be accumulated, shared, and reused across agents and teams.

Powered by [ResourceX](https://github.com/Deepractice/ResourceX), the resource system covers the full lifecycle through the `use` tool:

**Production** — create and package

| Command | What it does |
|---------|-------------|
| `!resource.add` | Register a local resource |
| `!prototype.summon` | Pull and register a prototype from source |
| `!prototype.banish` | Unregister a prototype |

**Distribution** — share and consume

| Command | What it does |
|---------|-------------|
| `!resource.push` | Publish a resource to a registry |
| `!resource.pull` | Download a resource from a registry |
| `!resource.search` | Search available resources |

**Inspection**

| Command | What it does |
|---------|-------------|
| `!resource.info` | View resource metadata |

This is how agent knowledge scales beyond a single individual — skills authored once can be distributed to any agent through prototypes and registries.

---

## Gherkin — The Universal Language

Everything in RoleX is expressed as Gherkin Features:

```gherkin
Feature: Sean
  A backend architect who builds AI agent frameworks.

  Scenario: Background
    Given I am a software engineer
    And I specialize in systems design
```

Goals, plans, tasks, principles, procedures, encounters, experiences — all Gherkin. This means:

- **Human-readable** — anyone can understand an agent's state
- **Structured** — parseable, diffable, versionable
- **Composable** — Features compose naturally into larger systems

## Storage

RoleX persists everything in SQLite at `~/.deepractice/rolex/`:

```
~/.deepractice/rolex/
├── rolex.db          # SQLite — single source of truth
├── prototype.json    # Prototype registry
└── context/          # Role context (focused goal/plan per role)
```

## Packages

| Package | Description |
|---------|-------------|
| `rolexjs` | Core API — Rolex class, namespaces, rendering |
| `@rolexjs/mcp-server` | MCP server for AI clients |
| `@rolexjs/core` | Core types, structures, platform interface |
| `@rolexjs/system` | Runtime interface, state merging, prototype |
| `@rolexjs/parser` | Gherkin parser |
| `@rolexjs/local-platform` | SQLite-backed runtime implementation |
| `@rolexjs/cli` | Command-line interface |

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
