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
    <a href="#english"><strong>English</strong></a> |
    <a href="#中文">简体中文</a>
  </p>
</div>

---

## English

RoleX lets AI agents have persistent identity, goals, plans, and tasks — all expressed in Gherkin `.feature` files. Instead of starting every conversation from scratch, your AI remembers who it is and what it's working on.

### Core Concepts

**Everything is Gherkin.** Identity, knowledge, goals, plans, tasks — one format, one language.

```text
Society (Rolex)          # Top-level: create roles, found organizations
  └── Organization       # Team structure: hire/fire roles
       └── Role          # First-person: identity, goals, plans, tasks
```

#### Five Dimensions of a Role

| Dimension    | What it is                                          | Example                                       |
| ------------ | --------------------------------------------------- | --------------------------------------------- |
| **Identity** | Who I am — persona, knowledge, experience, voice    | "I am Sean, a backend architect"              |
| **Goal**     | What I want to achieve — with success criteria      | "Build user authentication system"            |
| **Plan**     | How I'll do it — phased execution strategy          | "Phase 1: Schema, Phase 2: API, Phase 3: JWT" |
| **Task**     | Concrete work items — directly executable           | "Implement POST /api/auth/register"           |
| **Skill**    | What I can do — AI capabilities, no teaching needed | Tool use, code generation                     |

#### How It Works

1. **Activate nuwa (the genesis role)** — she guides everything else
2. nuwa creates roles, teaches knowledge, builds organizations
3. Each role works autonomously: set goals, make plans, execute tasks
4. Experience accumulates as part of identity — roles grow over time

### Quick Start

Install the MCP server and connect it to your AI client. That's it — nuwa will guide you from there.

#### Claude Desktop

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

#### Claude Code

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

#### Cursor

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

#### Windsurf

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

#### VS Code

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

#### JetBrains IDEs

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

#### Zed

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

### After Installation

Start a conversation with your AI and say:

> Activate nuwa

nuwa is the genesis role. She will bootstrap the environment and guide you through creating your own roles, organizations, and knowledge systems.

### MCP Tools

RoleX provides 15 tools through the MCP server, organized in three layers:

| Layer            | Tools                                                                                 | Who uses it |
| ---------------- | ------------------------------------------------------------------------------------- | ----------- |
| **Society**      | `society` (born, found, directory, find, teach)                                       | nuwa only   |
| **Organization** | `organization` (hire, fire)                                                           | nuwa only   |
| **Role**         | `identity`, `focus`, `want`, `plan`, `todo`, `achieve`, `abandon`, `finish`, `growup` | Any role    |

### Packages

| Package                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `@rolexjs/core`           | Core types and Platform interface                      |
| `@rolexjs/parser`         | Gherkin parser (wraps @cucumber/gherkin)               |
| `@rolexjs/local-platform` | Filesystem-based storage implementation                |
| `rolexjs`                 | Main package — Rolex + Organization + Role + bootstrap |
| `@rolexjs/mcp-server`     | MCP server for AI clients                              |
| `@rolexjs/cli`            | Command-line interface                                 |

### Storage Structure

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

## 中文

RoleX 让 AI 智能体拥有持久化的身份、目标、计划和任务 — 全部用 Gherkin `.feature` 文件表达。AI 不再每次对话都从零开始，而是记住自己是谁、正在做什么。

### 核心概念

**一切皆 Gherkin。** 身份、知识、目标、计划、任务 — 一种格式，一种语言。

```text
社会 (Rolex)             # 顶层：创造角色、建立组织
  └── 组织                # 团队结构：雇佣/解雇角色
       └── 角色           # 第一人称：身份、目标、计划、任务
```

#### 角色的五个维度

| 维度     | 含义                               | 示例                                    |
| -------- | ---------------------------------- | --------------------------------------- |
| **身份** | 我是谁 — 人格、知识、经验、语气    | "我是 Sean，一名后端架构师"             |
| **目标** | 我要达成什么 — 带有成功标准        | "构建用户认证系统"                      |
| **计划** | 我怎么做 — 分阶段执行策略          | "阶段1：Schema，阶段2：API，阶段3：JWT" |
| **任务** | 具体工作项 — 可直接执行            | "实现 POST /api/auth/register"          |
| **技能** | 我能做什么 — AI 自带能力，无需教授 | 工具使用、代码生成                      |

#### 工作流程

1. **激活女娲（创世角色）** — 她会引导一切
2. 女娲创造角色、传授知识、建立组织
3. 每个角色自主工作：设定目标、制定计划、执行任务
4. 经验积累成为身份的一部分 — 角色不断成长

### 快速开始

安装 MCP 服务器并连接到你的 AI 客户端，就这么简单 — 女娲会从那里引导你。

#### Claude Desktop (桌面版)

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）或 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）：

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

保存后重启 Claude Desktop。

#### Claude Code (命令行)

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

或在项目根目录添加 `.mcp.json`：

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

#### Cursor

添加到 `.cursor/mcp.json`（项目级）或 `~/.cursor/mcp.json`（全局）：

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

#### Windsurf

编辑 `~/.codeium/windsurf/mcp_config.json`：

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

#### VS Code

添加到 `.vscode/mcp.json`：

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

#### JetBrains IDEs

进入 **Settings > Tools > AI Assistant > Model Context Protocol (MCP)**，点击 **+** 粘贴：

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

#### Zed

添加到 Zed 的 `settings.json`：

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

### 安装之后

和你的 AI 对话，说：

> 激活女娲

女娲是创世角色。她会自动初始化环境，并引导你创建自己的角色、组织和知识体系。

### MCP 工具

RoleX 通过 MCP 服务器提供 15 个工具，分为三层：

| 层级     | 工具                                                                                  | 使用者   |
| -------- | ------------------------------------------------------------------------------------- | -------- |
| **社会** | `society`（born, found, directory, find, teach）                                      | 仅女娲   |
| **组织** | `organization`（hire, fire）                                                          | 仅女娲   |
| **角色** | `identity`, `focus`, `want`, `plan`, `todo`, `achieve`, `abandon`, `finish`, `growup` | 所有角色 |

### 包结构

| 包                        | 描述                                           |
| ------------------------- | ---------------------------------------------- |
| `@rolexjs/core`           | 核心类型和 Platform 接口                       |
| `@rolexjs/parser`         | Gherkin 解析器（封装 @cucumber/gherkin）       |
| `@rolexjs/local-platform` | 基于文件系统的存储实现                         |
| `rolexjs`                 | 主包 — Rolex + Organization + Role + bootstrap |
| `@rolexjs/mcp-server`     | 面向 AI 客户端的 MCP 服务器                    |
| `@rolexjs/cli`            | 命令行工具                                     |

### 存储结构

RoleX 将所有数据存储在 `.rolex/` 目录中：

```text
.rolex/
├── rolex.json                              # 组织配置
├── alex/
│   ├── identity/
│   │   ├── persona.identity.feature        # 我是谁
│   │   ├── arch.knowledge.identity.feature # 我知道什么
│   │   └── v1.experience.identity.feature  # 我学到了什么
│   └── goals/
│       └── auth-system/
│           ├── auth-system.goal.feature    # 我要做什么
│           ├── auth-system.plan.feature    # 我怎么做
│           └── tasks/
│               └── register.task.feature   # 具体工作
└── bob/
    ├── identity/
    └── goals/
```

---

<div align="center">
  <h3>Ecosystem</h3>
  <p>RoleX evolved from <a href="https://github.com/Deepractice/PromptX">PromptX</a> — rethinking AI role management with Gherkin-native identity and goal-driven development.</p>
  <p>RoleX 从 <a href="https://github.com/Deepractice/PromptX">PromptX</a> 演进而来 — 以 Gherkin 原生身份和目标驱动重新定义 AI 角色管理。</p>
  <br/>
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
