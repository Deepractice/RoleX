<div align="center">
  <h1>RoleX</h1>
  <p>
    <strong>AI 智能体社会化框架</strong>
  </p>
  <p>Social Framework for AI Agents</p>
  <p><em>以人类社会为模型，赋予 AI 智能体持久身份、社会结构和经验成长。</em></p>

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

## 为什么是"社会化"？

人类社会解决了一个 AI 智能体至今没有解决的问题：**如何组织、成长和延续**。

在社会中，人拥有身份、加入组织、担任职位、积累经验、传递知识。RoleX 将同样的模型带入 AI 智能体世界：

- **身份** — 智能体跨会话知道自己是谁，而不仅仅是在一次对话中
- **组织** — 智能体属于组织、担任职位、承担职责
- **成长** — 经验积累为原则和可复用的技能
- **持久化** — 目标、计划和知识在对话之间延续

一切都用 **Gherkin** `.feature` 格式表达 — 人类可读、结构化、可版本管理。

## 快速开始 — MCP

安装 MCP 服务器，连接到你的 AI 客户端，然后说 **"激活女娲"** — 她会引导你完成一切。

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

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

</details>

<details>
<summary><b>Cursor</b></summary>

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

</details>

<details>
<summary><b>VS Code</b></summary>

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

</details>

<details>
<summary><b>Windsurf</b></summary>

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

</details>

<details>
<summary><b>JetBrains IDEs</b></summary>

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

</details>

<details>
<summary><b>Zed</b></summary>

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

</details>

## 快速开始 — API

构建自己的 Agent 运行时、CLI 或平台集成：

```bash
npm install rolexjs @rolexjs/local-platform
```

```typescript
import { createRoleX } from "rolexjs";
import { localPlatform } from "@rolexjs/local-platform";

// 创建 — 同步返回，初始化延迟到首次调用
const rx = createRoleX({ platform: localPlatform() });

// 激活个体
const role = await rx.individual.activate({ individual: "nuwa" });

// 类型化命名空间 API — 9 个命名空间
await rx.society.born({ id: "alice", content: "Feature: Alice\n  一名前端工程师。" });
await rx.org.hire({ org: "deepractice", individual: "alice" });
await rx.position.appoint({ position: "frontend-lead", individual: "alice" });

// 角色操作 — 目标、计划、任务、认知
await role.want("Feature: 发布 v2\n  Scenario: 上线\n    Given 所有测试通过", "ship-v2");
await role.plan("Feature: 第一阶段\n  Scenario: 搭建 CI", "setup-ci");
await role.todo("Feature: 添加 lint 步骤\n  Scenario: PR 触发 Biome", "add-lint");
await role.finish("add-lint");

// JSON-RPC 2.0 — 统一调度协议
const response = await rx.rpc({
  jsonrpc: "2.0",
  method: "society.born",
  params: { id: "bob", content: "Feature: Bob" },
  id: 1,
});

// Protocol — 工具 schema + 世界指令，供任意 channel adapter 使用
const { tools, instructions } = rx.protocol;
// tools[0] = { name: "activate", description: "...", params: { ... } }
```

### Builder API

`createRoleX()` 返回 `RoleXBuilder` — 同步构建器，延迟初始化。首次异步调用触发初始化（genesis 原型、世界引导）。

**7 个类型化命名空间 + 2 个世界级方法：**

| API | 用途 |
|-----|------|
| `rx.individual` | 激活个体 — 返回有状态的 Role |
| `rx.society` | 个体与组织 — born, retire, teach, train, found, dissolve |
| `rx.org` | 成员与治理 — charter, hire, fire, establish, abolish |
| `rx.position` | 职位与职责 — charge, require, appoint, dismiss |
| `rx.project` | 项目管理 — scope, milestone, deliver, wiki |
| `rx.product` | 产品生命周期 — strategy, spec, release, channel |
| `rx.issue` | 议题追踪 — publish, comment, assign, label |
| `rx.resource` | 资源管理 — add, push, pull, search |
| `rx.inspect()` | 查看任意节点的完整状态 |
| `rx.survey()` | 列出个体、组织、职位 |

**统一调度：**

```typescript
// JSON-RPC 2.0 — 同一格式，本地或远程通用
await rx.rpc({ jsonrpc: "2.0", method: "org.hire", params: { org: "acme", individual: "alice" }, id: 1 });
```

**Protocol — 自描述的工具 schema：**

```typescript
// 基于 rx.protocol 构建任意 channel adapter（MCP、REST、CLI、A2A）
for (const tool of rx.protocol.tools) {
  register(tool.name, tool.description, tool.params);
}
```

## 运作方式

### 执行循环

激活后的智能体通过结构化生命周期追求目标：

```
activate → want → plan → todo → finish → complete / abandon
```

用 `want` 声明目标，用 `plan` 拆解为计划，用 `todo` 创建任务。完成任务会产生**经历** — 发生了什么的原始记录。

### 认知循环

经历驱动认知系统：

```
经历 → reflect → 经验 → realize / master → 原则 / 技能
```

`reflect` 将经历消化为经验。`realize` 将经验提炼为可迁移的**原则**。`master` 将经验沉淀为可复用的**技能**。智能体由此成长 — 从一个项目中学到的知识适用于下一个。

### 技能系统 — 渐进式加载

智能体无法一次加载所有技能。RoleX 采用三层模型：

| 层级 | 加载时机 | 内容 |
|------|---------|------|
| **技能元数据 (Procedure)** | 始终加载（激活时） | 技能是什么、何时使用 |
| **技能详情 (Skill)** | 按需，通过 `skill(locator)` | 完整指令 — 怎么做 |
| **外部资源 (Resource)** | 按需，通过 `use(locator)` | 模板、数据、工具 |

### Gherkin — 统一语言

RoleX 中的一切都用 Gherkin Feature 表达 — 目标、计划、任务、原则、技能、经历、经验。人类可读、结构化、可组合。

```gherkin
Feature: Sean
  一名构建 AI 智能体框架的后端架构师。

  Scenario: 背景
    Given 我是一名软件工程师
    And 我专注于系统设计
```

## 存储

RoleX 将所有数据持久化在单一 SQLite 数据库中：`~/.deepractice/rolex/rolex.db`。

## 包结构

| 包 | 描述 |
|----|------|
| `rolexjs` | 主入口 — Builder API、命名空间、渲染、内置 genesis |
| `@rolexjs/mcp-server` | 面向 AI 客户端的 MCP 服务器 |
| `@rolexjs/core` | 核心类型、命令、JSON-RPC、Protocol schema |
| `@rolexjs/genesis` | 世界基础原型（女娲主权） |
| `@rolexjs/system` | 运行时接口、状态合并 |
| `@rolexjs/parser` | Gherkin 解析器 |
| `@rolexjs/local-platform` | 基于 SQLite 的平台实现 |

---

<div align="center">
  <h3>生态系统</h3>
  <p><a href="https://github.com/Deepractice">Deepractice</a> AI 智能体基础设施：</p>
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
