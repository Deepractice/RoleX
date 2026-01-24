# RoleX

**AI Agent Role Management Framework**

RoleX is a framework for defining, composing, and loading AI agent roles. Built on top of [ResourceX](https://github.com/Deepractice/ResourceX), it provides type-safe role resource handling with version management and remote distribution.

## Features

- **Declarative Role Definition** - Define roles with personality, principle, and knowledge sections
- **Modular Composition** - Reuse modules via `@!thought://`, `@!execution://`, `@!knowledge://` references
- **ResourceX Integration** - First-class `role` type for ResourceX with versioning and remote distribution
- **Stateless Design** - `roleType` is a pure static object with no external dependencies

## Installation

```bash
bun add rolexjs resourcexjs
```

## Quick Start

### 1. Register roleType

```typescript
import { createRegistry } from "resourcexjs";
import { roleType } from "rolexjs";

// Create registry and register role type
const registry = createRegistry({
  type: "git",
  url: "https://github.com/Deepractice/Registry.git",
  domain: "deepractice.dev",
});
registry.supportType(roleType);
```

### 2. Load a Role

```typescript
// Resolve role resource
const resolved = await registry.resolve("deepractice.dev/nuwa.role@1.0.0");

// Execute to get rendered role
const role = await resolved.execute();

console.log(role.prompt); // Full system prompt
console.log(role.personality); // Personality section
console.log(role.principle); // Principle section
console.log(role.knowledge); // Knowledge section
```

## Role Definition Format

Roles are defined in `.role.md` files with three core sections:

```markdown
# Role Name

<role>

<personality>
I am an AI assistant.

Core principles:

- First principles thinking
- Dialogue-driven exploration

@!thought://first-principles
@!thought://dialogue-exploration
</personality>

<principle>
@!execution://workflow
@!execution://constraints
</principle>

<knowledge>
@!knowledge://domain-knowledge
@!knowledge://best-practices
</knowledge>

</role>
```

### Reference Format

- `@!thought://name` → `thought/name.thought.md`
- `@!execution://name` → `execution/name.execution.md`
- `@!knowledge://name` → `knowledge/name.knowledge.md`

### Directory Structure

```
my-role/
├── my-role.role.md           # Main file
├── thought/
│   ├── first-principles.thought.md
│   └── dialogue-exploration.thought.md
├── execution/
│   └── workflow.execution.md
└── knowledge/
    └── domain-knowledge.knowledge.md
```

## API

### roleType

```typescript
import { roleType } from "rolexjs";

// ResourceX resource type definition
roleType: ResourceType<void, RenderedRole>;
```

| Property    | Value                       |
| ----------- | --------------------------- |
| name        | `"role"`                    |
| aliases     | `["ai-role", "agent-role"]` |
| description | `"AI Agent Role"`           |

### RenderedRole

```typescript
interface RenderedRole {
  prompt: string; // Full rendered prompt
  personality: string; // Personality section
  principle: string; // Principle section
  knowledge: string; // Knowledge section
}
```

## Available Roles

The deepractice.dev Registry provides the following roles:

| Role                                   | Description                |
| -------------------------------------- | -------------------------- |
| `deepractice.dev/nuwa.role@1.0.0`      | AI Role Creation Expert    |
| `deepractice.dev/luban.role@1.0.0`     | AI Tool Integration Expert |
| `deepractice.dev/jiangziya.role@1.0.0` | Strategic Planning Expert  |
| `deepractice.dev/sean.role@1.0.0`      | Sean's Personal Assistant  |
| `deepractice.dev/shaqing.role@1.0.0`   | Shaqing Writing Assistant  |
| `deepractice.dev/teacheryo.role@1.0.0` | English Teaching Expert    |
| `deepractice.dev/writer.role@1.0.0`    | Writing Assistant          |

## Architecture

RoleX is part of the ResourceX ecosystem:

```
ResourceX (Resource Protocol Layer)
    ↓
RoleX (role type implementation)
    ↓
Role Resources (nuwa.role, luban.role, ...)
```

- **ResourceX** provides the resource management protocol (RXL, RXM, RXC, Registry)
- **RoleX** implements serialization and parsing logic for the `role` type
- **Role Resources** are stored in ResourceX registries

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun run test

# BDD tests
bun run test:bdd

# Type check
bun run typecheck

# Format
bun run format
```

## Package Structure

```
packages/
├── core/      # @rolexjs/core - Core implementation
└── rolexjs/   # rolexjs - Main package (re-exports core)
```

## License

MIT
