# @rolexjs/core

## 1.5.0

### Minor Changes

- 58bcb9b: Add @rolexjs/agentx-context package and survey/inspect raw mode

  - New package `@rolexjs/agentx-context`: RoleX ContextProvider bridge for AgentX runtime
    - RolexContext implements AgentX Context interface (schema, project, capabilities)
    - RolexContextProvider implements AgentX ContextProvider factory
    - Decouples RoleX from AgentX — AgentX no longer depends on rolexjs
  - Add `raw` option to `survey()` and `inspect()` API
    - `survey({ type: "individual", raw: true })` returns `State[]` (structured JSON)
    - `inspect({ id: "nuwa", raw: true })` returns `State` (structured JSON)
    - Without `raw`, behavior unchanged (returns rendered text)

- 96967bc: Refactor to builder pattern with JSON-RPC 2.0 unified dispatch

  - Replace async factory with synchronous `createRoleX()` builder — lazy initialization on first call
  - Add 9 typed namespace APIs: society, org, position, project, product, survey, issue, resource, role
  - Add JSON-RPC 2.0 dispatch via `rx.rpc()` — uniform message format for cloud platform decoupling
  - Add `rx.protocol` — self-describing tool schemas (name + description + params) for any channel adapter
  - Inline description into `ToolDef` — no more separate `detail()` lookup
  - Move genesis from platform config to built-in — `createRoleX({ platform })` auto-applies genesis
  - Remove `prototypes` from Platform interface — Platform is now pure infrastructure

- 2886169: Add inspect and survey as top-level perception tools

  - `inspect(id)`: project any node's full subtree, works on any node type
  - `survey(type?)`: world-level overview replacing census via direct
  - Extract `projectById` as shared structural primitive in RoleXService
  - Add InspectRenderer for generic node tree rendering
  - Replace census.feature with survey.feature
  - Fix gen-descriptions to quote hyphenated object keys

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

- 2494ba2: feat: multi-layer permission system and namespace redesign

  - Rename `individual.*` and `org.found/dissolve` commands to `society.*` namespace
  - Add 4-layer permission system: sovereign, org-admin, project-maintainer, product-owner
  - PermissionRegistry maps reverse relation names to permission arrays, injected at projection time
  - New commands: `org.admin/unadmin`, `project.maintain/unmaintain`
  - Add `.feature` description files with Parameters scenarios for all commands
  - V5 migration: make Nuwa an independent sovereign individual, dissolve rolex org
  - compactRelations updated to include new reverse relations (administer, maintained-by, own)

- b8a5ca6: feat: product created via project.produce with bidirectional relation

  Product is no longer created independently — it is produced from a project.
  Adds bidirectional relation: project → product (production) and product → project (origin).
  Removes product.create command and publish lifecycle process.

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

- 997e1d5: fix: defensive parsing for args serialized as JSON string by AI models
- d5ee5ab: refactor: lift compactRelations and projection logic from platform to core

  - Remove duplicated compactRelations from in-memory runtime and SQLite runtime
  - Add `compactState` post-processing in core's RoleXService (raw → compact → enrich)
  - Runtime.project() now returns raw trees; all business logic applied uniformly in core
  - Fixes online society service returning explosively large output (117K chars)

- Updated dependencies [d5ee5ab]
- Updated dependencies [8c1db15]
  - @rolexjs/system@1.5.0
  - @rolexjs/parser@1.5.0

## 1.4.0

### Minor Changes

- fe28a2b: Replace raw DDL with Drizzle ORM migrations for schema management. Add prototype_migrations table for Flyway-style migration history tracking. PrototypeRegistry now supports recordMigration, getMigrationHistory, and hasMigration methods.
- a6e717f: feat: add issue management as world instruction

  Issue management is now a built-in world instruction available to all roles,
  not just roles with the issue-management skill. This reflects that IssueX is
  a core collaboration primitive — enabling both self-collaboration across
  context breaks and inter-individual asynchronous coordination.

- b968e76: feat: add product management system

  New entity type for managing products with four concept layers:
  vision, strategy, specification (BDD contracts), and release.

  Commands: create, strategy, spec, release, channel, own, disown, deprecate.

- ffada31: Implement Flyway-style prototype migration system. Prototypes now support incremental versioned migrations — only unapplied migrations execute on restart.

  - Add `PrototypeData`, `Migration` types and `applyPrototype()` function
  - Rename `PrototypeRegistry` to `PrototypeRepository`
  - Add `version` column to `prototype_migrations` table
  - Remove `prototype.settle` MCP instruction (now internal-only)
  - Convert genesis from ResourceX resource to TS module with inline migrations
  - Replace `Platform.bootstrap` (string[]) with `Platform.prototypes` (PrototypeData[])

- 5cde1b1: Role rich domain model — merge prototype into core, Protocol export

  - Role is now a rich domain model in @rolexjs/core with ownership isolation, KV-serializable snapshot/restore, and all domain methods (want, plan, todo, finish, reflect, realize, master, etc.)
  - RoleXService orchestrates Role lifecycle, caching, and persistence in core
  - rolexjs becomes a thin rendering shell delegating to core's RoleXService
  - Protocol interface bundles tools + instructions as a single export for channel adapters
  - Removed scattered exports (render, genesis, createRendererRouter) from rolexjs public API
  - Deleted old Role class and RoleContext from rolexjs (replaced by core's Role)
  - Moved findInState utility to core

### Patch Changes

- ccef531: Make PrototypeRepository interface fully async. All methods now return Promises, enabling native async storage backends like Cloudflare D1.
- d5d6301: fix: align skill docs and tool descriptions with args parameter format

  - Fix use-protocol world instruction: changed "flat top-level parameters" to "args object"
  - Update use/direct tool descriptions with args usage examples
  - Update args parameter description to clarify object format
  - Update all 9 SKILL.md files to use nested args format in examples
  - @rolexjs/parser@1.4.0
  - @rolexjs/system@1.4.0

## 1.3.0

### Minor Changes

- 23552e0: feat: add bidirectional ownership relation between project and organization

  - Add ownership relation on project structure pointing to organization
  - project.launch accepts optional `org` parameter to link project to an organization
  - census.list tree view displays projects under their owning organization
  - Add BDD scenario and link assertion step for ownership verification

### Patch Changes

- @rolexjs/system@1.3.0

## 1.2.1

### Patch Changes

- a2ad0d5: Remove "bun" export condition from all packages

  The "bun" condition in exports pointed to ./src/index.ts which is not included in published npm packages, causing "Cannot find package" errors when consumed by bun runtime. All environments now use the compiled dist/ output.

  - @rolexjs/system@1.2.1

## 1.2.0

### Minor Changes

- ca32e1c: feat: integrate IssueX for issue tracking between AI individuals

  - Add IssueX support to Platform and LocalPlatform
  - Add issue operations (publish, get, list, update, close, reopen, assign, comment, label, unlabel) to prototype ops
  - Add issue-render module in rolexjs for human-readable output formatting
  - Role.use() now renders issue results as readable text instead of raw JSON
  - Add "number" to ParamType for issue instruction schemas

- e35aa19: feat: add Project as a top-level organizational primitive

  - Add project structure with 5 sub-concepts: scope, milestone, deliverable, wiki, and participation relation
  - Add 9 project operations: launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive
  - Add project-render module for human-readable project output (compact member display, milestone progress)
  - Add project lifecycle BDD feature with full test coverage
  - Fix BDD test suite for async Runtime refactor (await createRoleX, Role methods, writeContext via SQLite)

### Patch Changes

- @rolexjs/system@1.2.0

## 1.1.0

### Minor Changes

- 3de799b: Add resourcexExecutor to Platform interface for custom resolver execution

  Platform now accepts an optional CustomExecutor, passed through to ResourceX
  as isolator: "custom". Enables QuickJS Wasm execution in Workers environments.

### Patch Changes

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

- 8449a59: refactor: Platform integrates ResourceXProvider instead of ResourceX

  Platform now declares `resourcexProvider?: ResourceXProvider` instead of `resourcex?: ResourceX`.
  Rolex internally creates the ResourceX instance from the injected provider.
  This makes the storage backend decision explicit at the Platform level —
  swapping providers is all that's needed to move from local to cloud deployment.

- c5a6d7d: Introduce RoleXRepository interface and SqliteRepository implementation. Platform now uses `repository` instead of separate runtime/prototype/saveContext/loadContext. Prototypes and contexts stored in SQLite instead of JSON files.

### Patch Changes

- Updated dependencies [d7521ee]
- Updated dependencies [f7147ad]
- Updated dependencies [a9a1789]
- Updated dependencies [9180e24]
  - @rolexjs/system@1.0.0

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

## 0.10.0

## 0.9.1

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

## 0.6.0

### Minor Changes

- e537147: feat: add reflect() — distill experiences into knowledge

  Kantian Reflective Judgment: multiple concrete experiences are consumed
  and a transferable knowledge principle is created. Experience files are
  deleted, knowledge file is added to identity.

## 0.5.0

### Minor Changes

- 28b8b97: feat: enhance focus() to support multiple active goals and goal switching
  - Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
  - LocalPlatform: implement goal listing, .focus file for persistence
  - Role: focus(name?) returns current goal + other active goals
  - MCP server: focus tool accepts optional name param to switch goals

## 0.4.1

### Patch Changes

- eec37ca: Add bilingual README with MCP installation guide for 7 platforms

## 0.4.0

### Minor Changes

- 8fc5dfd: Extract LocalPlatform, pure bootstrap, fold MCP tools, unify package versions

## 0.3.0

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

## 0.2.0

### Minor Changes

- a3b4929: refactor: export roleType as BundledType for ResourceX integration

  - Add src/builtins/role.type.ts with resolve(ctx) logic
  - Modify build.ts to bundle role type into code string
  - Auto-generate roleType.ts with BundledType export
  - Fix loadRole and loadRoleSimple to use extract(rxr.archive)
  - Fix createResourceResolver to work without registry parameter
  - Remove old src/resource-type/ directory

  Now RoleX can be integrated with ResourceX via:

  ```typescript
  import { roleType } from "rolexjs";
  rx.supportType(roleType);
  ```

## 0.1.0

### Minor Changes

- 9b6a47b: feat: simplify roleType API
  - Export static `roleType` object instead of `createRoleType` factory
  - Remove registry dependency from `loadRoleSimple`
  - roleType is now stateless and can be used directly with any registry
