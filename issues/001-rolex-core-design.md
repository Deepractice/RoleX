# RoleX Core Design

## 概述

RoleX 是 DPML 的 Role 领域实现，专门处理 AI Agent Role 资源的解析和渲染。

## 背景

- **DPML**: 通用的 Prompt Markup Language 解析器
- **ResourceX**: 资源管理协议 (RXL/RXM/RXC/RXR)
- **RoleX**: DPML 在 Role 领域的具体实现

## 架构

```
DPML (通用标记语言)
  └── RoleX (Role 领域实现)
      ├── DPML Schemas (role, thought, execution, knowledge)
      ├── Role Transformer
      ├── Resource Resolver (统一 ARP)
      └── roleType (ResourceX 集成)
```

## 核心设计

### 1. 三层架构

- **Thought (思维层)**: 静态认知框架，"如何思考"
  - 子标签: `exploration`, `reasoning`, `challenge`, `plan`

- **Execution (行为层)**: 动态工作流程，"如何做"
  - 子标签: `process`, `constraint`, `rule`, `guideline`, `criteria`

- **Knowledge (知识层)**: 私有信息，填补语义鸿沟
  - 无子标签，直接内容

### 2. 引用机制

**统一使用 ARP 协议**，不做相对路径假设：

```xml
<role>
  <personality>
    <!-- 从 RXR 归档读取 -->
    <resource src="arp:text:rxr://deepractice.ai/nuwa.role@1.0.0/thought/first-principles.thought.md"/>

    <!-- 从文件系统读取（开发时） -->
    <resource src="arp:text:file://./thought/first-principles.thought.md"/>
  </personality>
</role>
```

**支持的 ARP Transport**:

- `file`: 本地文件系统
- `http/https`: 网络资源
- `rxr`: RXR 归档内文件 (ResourceX 1.7.0+)

### 3. Role 资源结构

```
role/{roleId}/
├── {roleId}.role.md          # 主文件
├── thought/
│   └── *.thought.md          # 思维模式文件
├── execution/
│   └── *.execution.md        # 工作流文件
└── knowledge/
    └── *.knowledge.md        # 私有知识文件
```

### 4. 核心 API

```typescript
// 从 RXR 加载 Role
async function loadRole(rxr: RXR, registry: Registry): Promise<RenderedRole>;

// 渲染结果
interface RenderedRole {
  prompt: string; // 最终渲染的完整 prompt
  personality: string; // personality 部分
  principle: string; // principle 部分
  knowledge: string; // knowledge 部分
}
```

### 5. ResourceX 集成

定义 `roleType` 作为 ResourceX 的资源类型：

```typescript
const roleType = defineResourceType({
  name: 'role',
  aliases: ['ai-role', 'agent-role'],
  serializer: { ... },
  resolver: {
    async resolve(rxr, context) {
      return {
        execute: async () => loadRole(rxr, context.registry),
        schema: undefined,
      };
    },
  },
});
```

## 实现步骤

### Phase 1: 需求澄清 ✅

- [x] 讨论 DPML 和 RoleX 的关系
- [x] 讨论引用机制（统一 ARP）
- [x] 讨论 ResourceX 集成

### Phase 2: BDD

- [ ] 编写 role loading feature
- [ ] 编写 resource resolution feature
- [ ] 编写 role rendering feature

### Phase 3: 实现

- [ ] 定义 DPML schemas
- [ ] 实现 roleTransformer
- [ ] 实现 resourceResolver
- [ ] 实现 loadRole
- [ ] 实现 roleType

## 依赖

- `dpml`: DPML 解析器
- `resourcexjs`: ResourceX (RXR, Registry)
- `@resourcexjs/arp`: ARP 协议 (RxrTransport)

## 参考

- [DPML README](../temp/PromptML/README.md)
- [ResourceX README](../temp/ResourceX/README.md)
- [PromptX nuwa role](../temp/PromptX/packages/resource/resources/role/nuwa/)
