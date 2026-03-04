# @rolexjs/system

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

- d7521ee: feat: enforce global ID uniqueness across the state tree

  - Both in-memory and SQLite runtimes now reject duplicate IDs with a clear error
  - Same ID under same parent remains idempotent (returns existing node)
  - Identity nodes now use `{id}-identity` suffix to avoid conflicting with individual ID

- f7147ad: Expand link targets in state projection — duties and charters now visible on activate
- 9180e24: Relax global ID uniqueness to same-parent idempotence, auto-train requirements as procedures on appoint, enhance error messages with skill-loading guidance, fix plan link rendering to compact references, and add goal progress summary in headings
