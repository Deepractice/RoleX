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

## 架构

RoleX 模拟了一个 AI 智能体的**社会**，映射人类组织的运作方式：

```
社会 (Society)
├── 个体 (Individual)      # 拥有身份、目标和知识的智能体
├── 组织 (Organization)    # 通过成员关系聚合个体
├── 职位 (Position)        # 定义职责和所需技能
└── 归档 (Past)            # 已退休/解散的实体存档
```

## 四大系统

RoleX 包含四个核心系统，各自服务于智能体生命周期的不同阶段。

### 执行系统 — 做事循环

目标驱动的工作生命周期。智能体声明想要什么，规划如何达成，然后执行。

```
activate → want → plan → todo → finish → complete / abandon
```

| 工具 | 作用 |
|------|------|
| `activate` | 进入角色 — 加载身份、目标、知识 |
| `focus` | 查看或切换当前目标 |
| `want` | 声明一个目标及成功标准 |
| `plan` | 将目标拆解为阶段（支持顺序和备选策略） |
| `todo` | 在计划下创建具体任务 |
| `finish` | 完成任务，可选记录发生了什么 |
| `complete` | 完成计划 — 策略成功 |
| `abandon` | 放弃计划 — 策略失败，但学习被保留 |

### 认知系统 — 成长循环

智能体如何成长。原始经历变为结构化经验，再提炼为可复用的知识。

```
经历 → reflect → 经验 → realize / master → 原则 / 技能
```

| 工具 | 作用 |
|------|------|
| `reflect` | 将经历消化为经验 — 模式识别 |
| `realize` | 将经验提炼为原则 — 可迁移的道理 |
| `master` | 将经验沉淀为技能 — 可复用的操作 |
| `forget` | 移除过时的知识 |

### 世界管理 — 通过 `use`

通过统一的 `use` 工具以 `!命名空间.方法` 格式管理社会结构。

**个体 (Individual)** — 智能体生命周期

| 命令 | 作用 |
|------|------|
| `!individual.born` | 创建个体 |
| `!individual.teach` | 注入原则（知识） |
| `!individual.train` | 注入技能（操作） |
| `!individual.retire` | 归档个体 |

**组织 (Organization)** — 组织结构

| 命令 | 作用 |
|------|------|
| `!org.found` | 创建组织 |
| `!org.charter` | 定义使命和章程 |
| `!org.hire` | 招聘成员 |
| `!org.fire` | 移除成员 |
| `!org.dissolve` | 解散组织 |

**职位 (Position)** — 角色与职责

| 命令 | 作用 |
|------|------|
| `!position.establish` | 设立职位 |
| `!position.charge` | 赋予职责 |
| `!position.require` | 声明所需技能 — 任命时自动培训 |
| `!position.appoint` | 任命个体（继承所需技能） |
| `!position.dismiss` | 免除职位 |
| `!position.abolish` | 废除职位 |

**普查 (Census)** — 社会级查询

| 命令 | 作用 |
|------|------|
| `!census.list` | 列出所有个体、组织、职位 |
| `!census.list { type: "individual" }` | 按类型过滤 |
| `!census.list { type: "past" }` | 查看归档实体 |

### 技能系统 — 渐进式加载

技能按需加载，保持智能体上下文精简：

1. **技能元数据 (Procedure)** （始终加载）— 技能是什么，何时使用
2. **技能详情 (Skill)** （按需）— 通过 `skill(locator)` 加载完整指令
3. **外部资源 (Resource)** （按需）— 通过 `use(locator)` 加载外部资源

### 资源系统 — 智能体的生产资料

资源是 AI 智能体的**生产资料** — 技能、原型、知识包，可以积累、共享、跨智能体和团队复用。

基于 [ResourceX](https://github.com/Deepractice/ResourceX) 驱动，资源系统覆盖完整生命周期：

**生产** — 创建和打包

| 命令 | 作用 |
|------|------|
| `!resource.add` | 注册本地资源 |
| `!prototype.summon` | 从源拉取并注册原型 |
| `!prototype.banish` | 注销原型 |

**分发** — 共享和获取

| 命令 | 作用 |
|------|------|
| `!resource.push` | 发布资源到注册中心 |
| `!resource.pull` | 从注册中心下载资源 |
| `!resource.search` | 搜索可用资源 |

**应用** — 加载和使用

| 命令 | 作用 |
|------|------|
| `skill(locator)` | 按需加载完整技能指令 |
| `use(locator)` | 执行或加载任意资源 |
| `!resource.info` | 查看资源详情 |

这就是智能体知识如何超越单个个体进行规模化的机制 — 一次编写的技能可以通过原型和注册中心分发给任何智能体。

## 快速开始

安装 MCP 服务器并连接到你的 AI 客户端，然后说 **"激活女娲"** — 她会引导你完成一切。

### Claude Code

```bash
claude mcp add rolex -- npx -y @rolexjs/mcp-server
```

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

## Gherkin — 统一语言

RoleX 中的一切都用 Gherkin Feature 表达：

```gherkin
Feature: Sean
  一名构建 AI 智能体框架的后端架构师。

  Scenario: 背景
    Given 我是一名软件工程师
    And 我专注于系统设计
```

目标、计划、任务、原则、技能、经历、经验 — 全部是 Gherkin。这意味着：

- **人类可读** — 任何人都能理解智能体的状态
- **结构化** — 可解析、可对比、可版本管理
- **可组合** — Feature 自然地组合成更大的系统

## 存储

RoleX 将所有数据持久化在 SQLite 中，位于 `~/.deepractice/rolex/`：

```
~/.deepractice/rolex/
├── rolex.db          # SQLite — 唯一数据源
├── prototype.json    # 原型注册表
└── context/          # 角色上下文（每个角色的当前焦点目标/计划）
```

## 包结构

| 包 | 描述 |
|----|------|
| `rolexjs` | 核心 API — Rolex 类、命名空间、渲染 |
| `@rolexjs/mcp-server` | 面向 AI 客户端的 MCP 服务器 |
| `@rolexjs/core` | 核心类型、结构定义、平台接口 |
| `@rolexjs/system` | 运行时接口、状态合并、原型 |
| `@rolexjs/parser` | Gherkin 解析器 |
| `@rolexjs/local-platform` | 基于 SQLite 的运行时实现 |
| `@rolexjs/cli` | 命令行工具 |

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
