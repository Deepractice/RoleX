# RoleX

AI Agent Role Management Framework

## Overview

RoleX is a framework for defining, composing, and executing AI agent roles. It provides a structured approach to managing agent capabilities and behaviors.

## Features

- 🎭 Role Definition - Define agent roles with clear capabilities
- 🔧 Role Composition - Compose complex roles from simpler ones
- 🚀 Role Execution - Execute roles with structured inputs/outputs
- 📦 Type-safe - Full TypeScript support
- ⚡️ Fast - Built with Bun for maximum performance

## Installation

```bash
bun add rolexjs
```

## Quick Start

```typescript
import { createRole } from "rolexjs";

const role = createRole();
console.log(role);
```

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0
- Node.js >= 22.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/Deepractice/RoleX.git
cd RoleX

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test
bun run test:bdd
```

### Project Structure

```
RoleX/
├── packages/
│   ├── core/       # @rolexjs/core - Core role management
│   └── rolexjs/    # rolexjs - Main package
├── bdd/            # BDD tests
├── .changeset/     # Changesets for versioning
└── .github/        # GitHub Actions workflows
```

## Documentation

See [CLAUDE.md](./CLAUDE.md) for development guidance and [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT © [Deepractice](https://github.com/Deepractice)
