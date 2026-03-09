# @rolexjs/genesis

## 1.4.0

### Minor Changes

- ffada31: Implement Flyway-style prototype migration system. Prototypes now support incremental versioned migrations — only unapplied migrations execute on restart.

  - Add `PrototypeData`, `Migration` types and `applyPrototype()` function
  - Rename `PrototypeRegistry` to `PrototypeRepository`
  - Add `version` column to `prototype_migrations` table
  - Remove `prototype.settle` MCP instruction (now internal-only)
  - Convert genesis from ResourceX resource to TS module with inline migrations
  - Replace `Platform.bootstrap` (string[]) with `Platform.prototypes` (PrototypeData[])

### Patch Changes

- 6f19241: feat: add project-management skill and project-manager to genesis

  Add project-manager position with duty and requirement.
  Appoint Nuwa as project-manager with project-management procedure.

- Updated dependencies [ccef531]
- Updated dependencies [fe28a2b]
- Updated dependencies [d5d6301]
- Updated dependencies [a6e717f]
- Updated dependencies [b968e76]
- Updated dependencies [ffada31]
- Updated dependencies [5cde1b1]
  - @rolexjs/core@1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- a9a1789: Release 1.0.0 — RoleX AI Agent Role Management Framework

  Highlights:

  - RoleXRepository unified data access layer (SQLite-backed)
  - Platform integrates ResourceXProvider for pluggable storage
  - Identity ethics and directive system for role boundaries
  - Batch consumption in reflect/realize/master
  - Global ID uniqueness enforcement
  - BDD test framework with MCP E2E coverage
  - Render layer sunk from MCP server into rolexjs

### Minor Changes

- 9882ecd: Rename @rolexjs/rolex-prototype to @rolexjs/genesis, consolidate descriptions into prototype package, and add direct tool for stateless world-level operations.
