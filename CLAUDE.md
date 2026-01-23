# CLAUDE.md

This file provides guidance to Claude Code when working with the RoleX project.

## Project Overview

RoleX is an AI Agent Role Management Framework for defining, composing, and executing agent roles.

## CommonX - Shared Infrastructure

All Deepractice projects should use `commonxjs` for common utilities.

**Install:**

```bash
bun add commonxjs
```

**Repository:** https://github.com/Deepractice/CommonX

---

## SQLite

**DO NOT** use `bun:sqlite`, `node:sqlite`, `better-sqlite3`, or `db0` directly.

Use `commonxjs/sqlite` for cross-runtime SQLite:

```typescript
import { openDatabase } from "commonxjs/sqlite";

const db = openDatabase("./data/app.db"); // or ":memory:"

db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");

const stmt = db.prepare("INSERT INTO users (name) VALUES (?)");
stmt.run("Alice");

const users = db.prepare("SELECT * FROM users").all();
console.log(users);

db.close();
```

**Features:**

- Auto-detects runtime (Bun → `bun:sqlite`, Node.js 22+ → `node:sqlite`)
- Auto-creates parent directories
- Zero external dependencies

---

## Logger

**DO NOT** use `console.log` directly in production code.

Use `commonxjs/logger`:

```typescript
import { createLogger } from "commonxjs/logger";

const logger = createLogger("rolex/module");

logger.debug("Debug message");
logger.info("Info message", { key: "value" });
logger.warn("Warning message");
logger.error("Error message");
```

**Features:**

- Lazy initialization (safe to call at module level)
- Pluggable backend via `setLoggerFactory()`
- Namespace-based logging

---

## Path Utilities

**DO NOT** use `import.meta.dir` directly (Node.js incompatible).

Use `commonxjs/path`:

```typescript
import {
  getModuleDir,
  getPackageRoot,
  getMonorepoRoot,
  resolveFromRoot,
  resolveFromPackage,
} from "commonxjs/path";

// Current module directory (cross-runtime __dirname)
const __dirname = getModuleDir(import.meta);

// Package root (where package.json is)
const pkgRoot = getPackageRoot(import.meta);

// Monorepo root
const root = getMonorepoRoot(import.meta);

// Resolve paths
const dataDir = resolveFromRoot(import.meta, "data");
const testFixtures = resolveFromPackage(import.meta, "tests", "fixtures");
```

---

## ID Generation

```typescript
import { generateId, generateRequestId } from "commonxjs/id";

const id = generateId(); // Unique ID
const reqId = generateRequestId(); // Request ID
```

---

## Commands

```bash
# Install dependencies
bun install

# Build all packages (uses Turborepo)
bun run build

# Run all unit tests
bun run test

# Run a single test file
bun test packages/core/tests/unit/role.test.ts

# Run BDD tests (Cucumber)
bun run test:bdd

# Lint
bun run lint

# Type check
bun run typecheck

# Format code
bun run format
```

## Architecture

### Package Structure

```
packages/
├── core/        # @rolexjs/core - Core role management
└── rolexjs/     # rolexjs - Main package (re-exports)
```

## Development Standards

### Package Manager

- Use **Bun** for all projects

### Publishing

- Use **changesets** for versioning and publishing

### CI/CD

- GitHub Actions with Bun setup

### TypeScript

- ESM modules (`"type": "module"`)
- Strict mode enabled

## Development Workflow

1. **Phase 1: Code Review** - Clarify requirements
2. **Phase 2: BDD** - Write `.feature` files
3. **Phase 3: Implementation** - TDD (tests → code)

## Conventions

- Uses Bun as package manager and runtime
- ESM modules only (`"type": "module"`)
- TypeScript with strict mode
- **Path aliases**: Use `~/` instead of `../` for imports within packages
- Keep `.js` extensions in imports for ESM compatibility
- Commits follow Conventional Commits (enforced by commitlint via lefthook)
- Pre-commit hooks auto-format and lint staged files
- Turborepo manages build orchestration

## Testing

- **Unit tests**: `packages/*/tests/unit/**/*.test.ts` (Bun test)
- **BDD tests**: `bdd/features/**/*.feature` + `bdd/steps/**/*.steps.ts` (Cucumber)
- **TDD approach**: Write tests first, then implement
