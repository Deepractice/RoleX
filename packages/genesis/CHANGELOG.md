# @rolexjs/genesis

## 1.5.0

### Minor Changes

- 96967bc: Refactor to builder pattern with JSON-RPC 2.0 unified dispatch

  - Replace async factory with synchronous `createRoleX()` builder — lazy initialization on first call
  - Add 9 typed namespace APIs: society, org, position, project, product, survey, issue, resource, role
  - Add JSON-RPC 2.0 dispatch via `rx.rpc()` — uniform message format for cloud platform decoupling
  - Add `rx.protocol` — self-describing tool schemas (name + description + params) for any channel adapter
  - Inline description into `ToolDef` — no more separate `detail()` lookup
  - Move genesis from platform config to built-in — `createRoleX({ platform })` auto-applies genesis
  - Remove `prototypes` from Platform interface — Platform is now pure infrastructure

- 2494ba2: feat: multi-layer permission system and namespace redesign

  - Rename `individual.*` and `org.found/dissolve` commands to `society.*` namespace
  - Add 4-layer permission system: sovereign, org-admin, project-maintainer, product-owner
  - PermissionRegistry maps reverse relation names to permission arrays, injected at projection time
  - New commands: `org.admin/unadmin`, `project.maintain/unmaintain`
  - Add `.feature` description files with Parameters scenarios for all commands
  - V5 migration: make Nuwa an independent sovereign individual, dissolve rolex org
  - compactRelations updated to include new reverse relations (administer, maintained-by, own)

### Patch Changes

- 05a2791: fix: update genesis migrations to use new command namespaces
- Updated dependencies [58bcb9b]
- Updated dependencies [96967bc]
- Updated dependencies [997e1d5]
- Updated dependencies [2886169]
- Updated dependencies [3f082fe]
- Updated dependencies [d5ee5ab]
- Updated dependencies [2494ba2]
- Updated dependencies [b8a5ca6]
- Updated dependencies [3516193]
- Updated dependencies [8c1db15]
  - @rolexjs/core@1.5.0

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
