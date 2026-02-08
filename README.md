<div align="center">
  <h1>RoleX</h1>
  <p>
    <strong>Role-Driven Development (RDD) Framework for AI Agents</strong>
  </p>
  <p>AI 智能体角色驱动开发框架</p>

  <p>
    <b>Persistent Identity</b> · <b>Goal-Driven</b> · <b>Gherkin-Native</b> · <b>MCP Ready</b>
  </p>
  <p>
    <b>持久身份</b> · <b>目标驱动</b> · <b>Gherkin 原生</b> · <b>MCP 即用</b>
  </p>

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

RoleX lets AI agents have persistent identity, goals, plans, and tasks — all expressed in Gherkin `.feature` files. Instead of starting every conversation from scratch, your AI remembers who it is and what it's working on.

RoleX evolved from [PromptX](https://github.com/Deepractice/PromptX) — rethinking AI role management with Gherkin-native identity and goal-driven development.

## Core Concepts

**Everything is Gherkin.** Identity, knowledge, goals, plans, tasks — one format, one language.

```text
Society (Rolex)          # Top-level: create roles, found organizations
  └── Organization       # Team structure: hire/fire roles
       └── Role          # First-person: identity, goals, plans, tasks
```

### Five Dimensions of a Role

| Dimension    | What it is                                          | Example                                       |
| ------------ | --------------------------------------------------- | --------------------------------------------- |
| **Identity** | Who I am — persona, knowledge, experience, voice    | "I am Sean, a backend architect"              |
| **Goal**     | What I want to achieve — with success criteria      | "Build user authentication system"            |
| **Plan**     | How I'll do it — phased execution strategy          | "Phase 1: Schema, Phase 2: API, Phase 3: JWT" |
| **Task**     | Concrete work items — directly executable           | "Implement POST /api/auth/register"           |
| **Skill**    | What I can do — AI capabilities, no teaching needed | Tool use, code generation                     |

### How It Works

1. **Activate nuwa (the genesis role)** — she guides everything else
2. nuwa creates roles, teaches knowledge, builds organizations
3. Each role works autonomously: set goals, make plans, execute tasks
4. Experience accumulates as part of identity — roles grow over time

## Quick Start

Install the MCP server and connect it to your AI client. That's it — nuwa will guide you from there.

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

Restart Claude Desktop after saving.

### Claude Code

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

Or add to your project's `.mcp.json`:

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

## After Installation

Start a conversation with your AI and say:

> Activate nuwa

nuwa is the genesis role. She will bootstrap the environment and guide you through creating your own roles, organizations, and knowledge systems.

## MCP Tools

RoleX provides 15 tools through the MCP server, organized in three layers:

| Layer            | Tools                                                                                 | Who uses it |
| ---------------- | ------------------------------------------------------------------------------------- | ----------- |
| **Society**      | `society` (born, found, directory, find, teach)                                       | nuwa only   |
| **Organization** | `organization` (hire, fire)                                                           | nuwa only   |
| **Role**         | `identity`, `focus`, `want`, `plan`, `todo`, `achieve`, `abandon`, `finish`, `growup` | Any role    |

## Packages

| Package                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `@rolexjs/core`           | Core types and Platform interface                      |
| `@rolexjs/parser`         | Gherkin parser (wraps @cucumber/gherkin)               |
| `@rolexjs/local-platform` | Filesystem-based storage implementation                |
| `rolexjs`                 | Main package — Rolex + Organization + Role + bootstrap |
| `@rolexjs/mcp-server`     | MCP server for AI clients                              |
| `@rolexjs/cli`            | Command-line interface                                 |

## Storage Structure

RoleX stores everything in a `.rolex/` directory:

```text
.rolex/
├── rolex.json                              # Organization config
├── alex/
│   ├── identity/
│   │   ├── persona.identity.feature        # Who I am
│   │   ├── arch.knowledge.identity.feature # What I know
│   │   └── v1.experience.identity.feature  # What I've learned
│   └── goals/
│       └── auth-system/
│           ├── auth-system.goal.feature    # What I want
│           ├── auth-system.plan.feature    # How I'll do it
│           └── tasks/
│               └── register.task.feature   # Concrete work
└── bob/
    ├── identity/
    └── goals/
```

---

<div align="center">
  <h3>Ecosystem</h3>
  <p>Part of the <a href="https://github.com/Deepractice">Deepractice</a> AI Agent infrastructure:</p>
  <p>
    <a href="https://github.com/Deepractice/AgentX"><strong>AgentX</strong></a> ·
    <a href="https://github.com/Deepractice/PromptX"><strong>PromptX</strong></a> ·
    <a href="https://github.com/Deepractice/ResourceX"><strong>ResourceX</strong></a> ·
    <a href="https://github.com/Deepractice/RoleX"><strong>RoleX</strong></a>
  </p>
</div>

---

<div align="center">
  <p>MIT License &copy; <a href="https://github.com/Deepractice">Deepractice</a></p>
</div>
