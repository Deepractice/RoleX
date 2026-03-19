# @rolexjs/system

## 1.5.0

### Minor Changes

- 8c1db15: feat: multi-value tags — `tag: string` → `tags: string[]`

  Structure.tag (single string) is replaced by Structure.tags (string array).
  Runtime.tag() is replaced by Runtime.addTag() and Runtime.removeTag().

  - Structure interface: `tag?: string` → `tags?: readonly string[]`
  - Runtime: `tag(node, tag)` → `addTag(node, tag)` + `removeTag(node, tag)`
  - Storage: DB column stays as `tag TEXT`, stores JSON array
  - All renderers updated to render multiple tags as `#tag1 #tag2`
  - Issue labels now use addTag/removeTag natively (no more comma-separated hack)
  - Goal/plan/task status tags (done, abandoned) work unchanged

### Patch Changes

- d5ee5ab: refactor: lift compactRelations and projection logic from platform to core

  - Remove duplicated compactRelations from in-memory runtime and SQLite runtime
  - Add `compactState` post-processing in core's RoleXService (raw → compact → enrich)
  - Runtime.project() now returns raw trees; all business logic applied uniformly in core
  - Fixes online society service returning explosively large output (117K chars)

## 1.4.0

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

- d7521ee: feat: enforce global ID uniqueness across the state tree

  - Both in-memory and SQLite runtimes now reject duplicate IDs with a clear error
  - Same ID under same parent remains idempotent (returns existing node)
  - Identity nodes now use `{id}-identity` suffix to avoid conflicting with individual ID

- f7147ad: Expand link targets in state projection — duties and charters now visible on activate
- 9180e24: Relax global ID uniqueness to same-parent idempotence, auto-train requirements as procedures on appoint, enhance error messages with skill-loading guidance, fix plan link rendering to compact references, and add goal progress summary in headings
