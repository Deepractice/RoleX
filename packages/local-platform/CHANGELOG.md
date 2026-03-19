# @rolexjs/local-platform

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

- 3f082fe: feat: internalize issue into graph — remove IssueX dependency

  Issues are now first-class graph nodes under society, no longer stored in external IssueX.

  - Add `issue` and `comment` structure types with author/assignee relations
  - Rewrite all issue.\* commands to use graph operations (rt.create, rt.tag, rt.link)
  - Issue status uses tags (#open / #closed), number uses auto-increment id pattern
  - Comments are child nodes of issues, authors linked via relations
  - Remove all IssueX dependencies (@issuexjs/core, issuexjs, @issuexjs/node)
  - Remove issue-render.ts — issues now return CommandResult through standard renderer
  - Remove outdated prototype migration BDD tests (relied on unregistered RPC methods)
  - Platform interface fully simplified: only repository + initializer remain

- 3516193: feat: purify RoleX — remove ResourceX, use, skill, and MCP server

  RoleX becomes a pure concept space. External tool execution moves to AgentX.

  - Remove `resource.*` commands, instructions, and namespace
  - Remove `use` tool (subjective execution) — `direct` covers world commands
  - Remove `skill` tool — skill loading moves to AgentX capability layer
  - Remove `@rolexjs/mcp-server` — channel adapter no longer maintained
  - Remove `resourcexProvider` and `resourcexExecutor` from Platform
  - Remove `Role.use()`, `Role.skill()`, and related deps (direct, transformUseResult)
  - Simplify `direct` method — no longer falls back to ResourceX
  - Clean up resourcexjs dependencies from core and local-platform
  - IssueX retained temporarily (will be internalized to graph in Phase 2)

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
  - @rolexjs/system@1.5.0

## 1.4.0

### Minor Changes

- fe28a2b: Replace raw DDL with Drizzle ORM migrations for schema management. Add prototype_migrations table for Flyway-style migration history tracking. PrototypeRegistry now supports recordMigration, getMigrationHistory, and hasMigration methods.
- ffada31: Implement Flyway-style prototype migration system. Prototypes now support incremental versioned migrations — only unapplied migrations execute on restart.

  - Add `PrototypeData`, `Migration` types and `applyPrototype()` function
  - Rename `PrototypeRegistry` to `PrototypeRepository`
  - Add `version` column to `prototype_migrations` table
  - Remove `prototype.settle` MCP instruction (now internal-only)
  - Convert genesis from ResourceX resource to TS module with inline migrations
  - Replace `Platform.bootstrap` (string[]) with `Platform.prototypes` (PrototypeData[])

### Patch Changes

- ccef531: Make PrototypeRepository interface fully async. All methods now return Promises, enabling native async storage backends like Cloudflare D1.
- Updated dependencies [ccef531]
- Updated dependencies [fe28a2b]
- Updated dependencies [d5d6301]
- Updated dependencies [a6e717f]
- Updated dependencies [b968e76]
- Updated dependencies [ffada31]
- Updated dependencies [5cde1b1]
  - @rolexjs/core@1.4.0
  - @rolexjs/system@1.4.0

## 1.3.0

### Patch Changes

- Updated dependencies [23552e0]
  - @rolexjs/core@1.3.0
  - @rolexjs/system@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [a2ad0d5]
  - @rolexjs/core@1.2.1
  - @rolexjs/system@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies [ca32e1c]
- Updated dependencies [e35aa19]
  - @rolexjs/core@1.2.0
  - @rolexjs/system@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies [3de799b]
  - @rolexjs/core@1.1.0
  - @rolexjs/system@1.1.0

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

- 260b06d: Expand link targets in SQLite runtime projection and fold requirement nodes by default
- d7521ee: feat: enforce global ID uniqueness across the state tree

  - Both in-memory and SQLite runtimes now reject duplicate IDs with a clear error
  - Same ID under same parent remains idempotent (returns existing node)
  - Identity nodes now use `{id}-identity` suffix to avoid conflicting with individual ID

- 8449a59: refactor: Platform integrates ResourceXProvider instead of ResourceX

  Platform now declares `resourcexProvider?: ResourceXProvider` instead of `resourcex?: ResourceX`.
  Rolex internally creates the ResourceX instance from the injected provider.
  This makes the storage backend decision explicit at the Platform level —
  swapping providers is all that's needed to move from local to cloud deployment.

- c5a6d7d: Introduce RoleXRepository interface and SqliteRepository implementation. Platform now uses `repository` instead of separate runtime/prototype/saveContext/loadContext. Prototypes and contexts stored in SQLite instead of JSON files.
- 9180e24: Relax global ID uniqueness to same-parent idempotence, auto-train requirements as procedures on appoint, enhance error messages with skill-loading guidance, fix plan link rendering to compact references, and add goal progress summary in headings

### Patch Changes

- Updated dependencies [d7521ee]
- Updated dependencies [f7147ad]
- Updated dependencies [a9a1789]
- Updated dependencies [8449a59]
- Updated dependencies [c5a6d7d]
- Updated dependencies [9180e24]
  - @rolexjs/system@1.0.0
  - @rolexjs/core@1.0.0

## 0.11.0

### Minor Changes

- e8fcab2: feat: rename growup to synthesize with Kantian epistemology semantics
  - Rename `growup()` to `synthesize()` — experience-only (a posteriori learning)
  - Rename Platform.growup to Platform.addIdentity (neutral internal storage method)
  - Add optional `experience` parameter to `finish()` for task-level synthesis
  - Add synthesis awareness section to INSTRUCTIONS (proactive memory triggers)
  - Add user memory intent recognition ("记一下", "remember this" → synthesize)
  - teach() remains the entry point for knowledge/voice (a priori transmission)
  - achieve/abandon/finish now form a consistent triad with experience hooks

### Patch Changes

- Updated dependencies [e8fcab2]
  - @rolexjs/core@0.11.0
  - @rolexjs/parser@0.11.0

## 0.10.0

### Patch Changes

- @rolexjs/core@0.10.0
- @rolexjs/parser@0.10.0

## 0.9.1

### Patch Changes

- 3bb910b: fix(local-platform): make reflect() transactional — write before erase

  Previously, `reflect()` deleted experience files before creating the knowledge file. If knowledge creation failed, experiences would be permanently lost. Now the operation order is: validate all experiences exist → create knowledge → delete experiences. Also adds input validation for empty arrays and path traversal protection.

  - @rolexjs/core@0.9.1
  - @rolexjs/parser@0.9.1

## 0.9.0

### Minor Changes

- 99bcce5: feat: three-entity architecture (Role, Organization, Position)
  - Role (WHO), Organization (WHERE), Position (WHAT) as independent entities
  - State machines: free → member → on_duty, vacant → filled
  - New API: establish(), appoint(), dismiss() for position management
  - Gherkin-defined duties inject into identity at runtime
  - New directory structure: roles/<name>/, orgs/<org>/positions/<pos>/
  - Auto-dismiss on fire, one-to-one constraints
  - Updated nuwa seed with three-entity knowledge

### Patch Changes

- Updated dependencies [99bcce5]
  - @rolexjs/core@0.9.0
  - @rolexjs/parser@0.9.0

## 0.8.0

### Minor Changes

- 686ce6f: feat: RolexConfig as CAS source of truth, waiter default role
  - Add `RolexConfig` and `OrganizationConfig` types to core
  - rolex.json is now the single source of truth (CAS): `{ roles, organization }`
  - `born()` registers role in config.roles — no directory scanning needed
  - `loadConfig()` always returns valid config (auto-creates default)
  - Organization is optional (`organization: null` when no org founded)
  - Add waiter/小二 as default onboarding role (auto-activated on MCP startup)
  - Fix null-safety for `organization()` across Rolex, Organization, MCP server
  - Remove old seed rolex.json (generate-seed.ts scans directories at build time)
  - Update tests for new RolexConfig format and focus() multi-goal API

### Patch Changes

- Updated dependencies [686ce6f]
  - @rolexjs/core@0.8.0
  - @rolexjs/parser@0.8.0

## 0.7.0

### Minor Changes

- 71a8860: feat: unified error handling, society directory fix, workflow hints
  - Error handling: all tool errors render as structured markdown with
    tool name, error message, and pattern-matched actionable hints.
  - Society directory: `directory()` and `find()` now see all born roles,
    not just hired ones. Added `allBornRoles()` to Platform interface.
  - Workflow hints: every write operation returns a **Next** hint guiding
    the AI to the next logical step. Static hints in shared render layer,
    dynamic hints for `hire(name)` and `finish(remaining)`.

### Patch Changes

- Updated dependencies [71a8860]
  - @rolexjs/core@0.7.0
  - @rolexjs/parser@0.7.0

## 0.6.0

### Minor Changes

- e537147: feat: add reflect() — distill experiences into knowledge

  Kantian Reflective Judgment: multiple concrete experiences are consumed
  and a transferable knowledge principle is created. Experience files are
  deleted, knowledge file is added to identity.

### Patch Changes

- Updated dependencies [e537147]
  - @rolexjs/core@0.6.0
  - @rolexjs/parser@0.6.0

## 0.5.0

### Minor Changes

- 28b8b97: feat: enhance focus() to support multiple active goals and goal switching
  - Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
  - LocalPlatform: implement goal listing, .focus file for persistence
  - Role: focus(name?) returns current goal + other active goals
  - MCP server: focus tool accepts optional name param to switch goals

### Patch Changes

- Updated dependencies [28b8b97]
  - @rolexjs/core@0.5.0
  - @rolexjs/parser@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [eec37ca]
  - @rolexjs/core@0.4.1
  - @rolexjs/parser@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [8fc5dfd]
  - @rolexjs/core@0.4.0
  - @rolexjs/parser@0.4.0

## 0.2.0

### Minor Changes

- fb2e6c6: feat: extract LocalPlatform, pure bootstrap, folded MCP tools
  - Extract `@rolexjs/local-platform` as independent package
  - Pure `bootstrap(platform)` with build-time seed inlining (zero fs dependency)
  - 女娲 born at society level, not hired into any organization
  - `Rolex.role(name)` for direct society-level role access
  - Fold MCP society/organization operations into 2 admin tools (nuwa-only)
  - Unified Gherkin rendering layer (`renderFeature`/`renderFeatures`)
  - `teach` moved from Organization to Society (Rolex) level
  - Default storage at `~/.rolex`

### Patch Changes

- Updated dependencies [fb2e6c6]
  - @rolexjs/core@0.3.0
  - @rolexjs/parser@0.1.1
