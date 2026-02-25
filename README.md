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

## Architecture

RoleX models a **society** of AI agents, mirroring how human organizations work:

```
Society
├── Individual      # An agent with identity, goals, and knowledge
├── Organization    # Groups individuals via membership
├── Position        # Defines roles with duties and required skills
└── Past            # Archive for retired/dissolved entities
```

## Systems

RoleX has four core systems. Each serves a distinct purpose in the agent lifecycle.

### Execution — The Doing Cycle

Goal-driven work lifecycle. The agent declares what it wants, plans how to get there, and executes.

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

### Cognition — The Learning Cycle

How agents grow. Raw encounters become structured experience, then distilled into reusable knowledge.

```
encounter → reflect → experience → realize / master → principle / procedure
```

| Tool | What it does |
|------|-------------|
| `reflect` | Digest encounters into experience — pattern recognition |
| `realize` | Distill experience into a principle — transferable truth |
| `master` | Distill experience into a procedure — reusable skill |
| `forget` | Remove outdated knowledge |

### World Management — via `use`

Manage the society structure through the unified `use` tool with `!namespace.method` commands.

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
| `!org.hire` | Add a member |
| `!org.fire` | Remove a member |
| `!org.dissolve` | Archive an organization |

**Position** — roles and responsibilities

| Command | What it does |
|---------|-------------|
| `!position.establish` | Create a position |
| `!position.charge` | Assign a duty |
| `!position.require` | Declare a required skill — auto-trained on appointment |
| `!position.appoint` | Appoint an individual (inherits required skills) |
| `!position.dismiss` | Remove an individual from a position |
| `!position.abolish` | Archive a position |

**Census** — society-level queries

| Command | What it does |
|---------|-------------|
| `!census.list` | List all individuals, organizations, positions |
| `!census.list { type: "individual" }` | Filter by type |
| `!census.list { type: "past" }` | View archived entities |

### Skill System — Progressive Disclosure

Skills load on demand, keeping the agent's context lean:

1. **Procedure** (always loaded) — metadata: what the skill is, when to use it
2. **Skill** (on demand) — full instructions loaded via `skill(locator)`
3. **Resource** (on demand) — external resources loaded via `use(locator)`

### Resource System — Agent Capital

Resources are the **means of production** for AI agents — skills, prototypes, and knowledge packages that can be accumulated, shared, and reused across agents and teams.

Powered by [ResourceX](https://github.com/Deepractice/ResourceX), the resource system handles the full lifecycle:

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

**Application** — load and use

| Command | What it does |
|---------|-------------|
| `skill(locator)` | Load full skill instructions on demand |
| `use(locator)` | Execute or ingest any resource |
| `!resource.info` | Inspect a resource |

This is how agent knowledge scales beyond a single individual — skills authored once can be distributed to any agent through prototypes and registries.

## Quick Start

Install the MCP server and connect it to your AI client. Then say **"activate nuwa"** — she will guide you from there.

### Claude Code

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

### Claude Desktop

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

### Cursor

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

### VS Code

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

### Windsurf

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

### JetBrains IDEs

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

### Zed

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
