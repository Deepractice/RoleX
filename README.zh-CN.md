<div align="center">
  <h1>RoleX</h1>
  <p>
    <strong>AI 智能体角色驱动开发（RDD）框架</strong>
  </p>
  <p>Role-Driven Development Framework for AI Agents</p>

  <p>
    <b>持久身份</b> · <b>目标驱动</b> · <b>Gherkin 原生</b> · <b>MCP 即用</b>
  </p>
  <p>
    <b>Persistent Identity</b> · <b>Goal-Driven</b> · <b>Gherkin-Native</b> · <b>MCP Ready</b>
  </p>

  <p>
    <a href="https://github.com/Deepractice/RoleX"><img src="https://img.shields.io/github/stars/Deepractice/RoleX?style=social" alt="Stars"/></a>
    <img src="https://visitor-badge.laobi.icu/badge?page_id=Deepractice.RoleX" alt="Views"/>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Deepractice/RoleX?color=blue" alt="License"/></a>
    <a href="https://www.npmjs.com/package/rolexjs"><img src="https://img.shields.io/npm/v/rolexjs?color=cb3837&logo=npm" alt="npm"/></a>
  </p>

  <p>
    <a href="README.md">English</a> |
    <a href="README.zh-CN.md"><strong>简体中文</strong></a>
  </p>
</div>

---

RoleX 让 AI 智能体拥有持久化的身份、目标、计划和任务 — 全部用 Gherkin `.feature` 文件表达。AI 不再每次对话都从零开始，而是记住自己是谁、正在做什么。

RoleX 从 [PromptX](https://github.com/Deepractice/PromptX) 演进而来 — 以 Gherkin 原生身份和目标驱动重新定义 AI 角色管理。

## 核心概念

**一切皆 Gherkin。** 身份、知识、目标、计划、任务 — 一种格式，一种语言。

```text
社会 (Rolex)             # 顶层：创造角色、建立组织
  └── 组织                # 团队结构：雇佣/解雇角色
       └── 角色           # 第一人称：身份、目标、计划、任务
```

### 角色的五个维度

| 维度     | 含义                               | 示例                                    |
| -------- | ---------------------------------- | --------------------------------------- |
| **身份** | 我是谁 — 人格、知识、经验、语气    | "我是 Sean，一名后端架构师"             |
| **目标** | 我要达成什么 — 带有成功标准        | "构建用户认证系统"                      |
| **计划** | 我怎么做 — 分阶段执行策略          | "阶段1：Schema，阶段2：API，阶段3：JWT" |
| **任务** | 具体工作项 — 可直接执行            | "实现 POST /api/auth/register"          |
| **技能** | 我能做什么 — AI 自带能力，无需教授 | 工具使用、代码生成                      |

### 工作流程

1. **激活女娲（创世角色）** — 她会引导一切
2. 女娲创造角色、传授知识、建立组织
3. 每个角色自主工作：设定目标、制定计划、执行任务
4. 经验积累成为身份的一部分 — 角色不断成长

## 快速开始

安装 MCP 服务器并连接到你的 AI 客户端，就这么简单 — 女娲会从那里引导你。

### Claude Desktop

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

### Claude Code

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

### Cursor

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

### Windsurf

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

### VS Code

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

### JetBrains IDEs

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

### Zed

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

## 安装之后

和你的 AI 对话，说：

> 激活女娲

女娲是创世角色。她会自动初始化环境，并引导你创建自己的角色、组织和知识体系。

## MCP 工具

RoleX 通过 MCP 服务器提供 15 个工具，分为三层：

| 层级     | 工具                                                                                      | 使用者   |
| -------- | ----------------------------------------------------------------------------------------- | -------- |
| **社会** | `society`（born, found, directory, find, teach）                                          | 仅女娲   |
| **组织** | `organization`（hire, fire）                                                              | 仅女娲   |
| **角色** | `identity`, `focus`, `want`, `plan`, `todo`, `achieve`, `abandon`, `finish`, `synthesize` | 所有角色 |

## 包结构

| 包                        | 描述                                           |
| ------------------------- | ---------------------------------------------- |
| `@rolexjs/core`           | 核心类型和 Platform 接口                       |
| `@rolexjs/parser`         | Gherkin 解析器（封装 @cucumber/gherkin）       |
| `@rolexjs/local-platform` | 基于文件系统的存储实现                         |
| `rolexjs`                 | 主包 — Rolex + Organization + Role + bootstrap |
| `@rolexjs/mcp-server`     | 面向 AI 客户端的 MCP 服务器                    |
| `@rolexjs/cli`            | 命令行工具                                     |

## 存储结构

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
  <h3>生态系统</h3>
  <p><a href="https://github.com/Deepractice">Deepractice</a> AI 智能体基础设施：</p>
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
