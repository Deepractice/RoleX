# rolexjs

## 1.4.0

### Minor Changes

- c173792: Auto-apply prototypes during createRoleX initialization. Callers no longer need to explicitly call rolex.genesis().
- 6be2390: refactor: census.list returns structured CommandResult instead of string

  - census.list now returns CommandResult with structured State tree
  - CensusRenderer handles org-tree Markdown rendering (moved from commands.ts)
  - Remove CensusEntry type (no longer needed)

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

- 8988ee9: feat: add renderer router — direct() renders Markdown by default

  - RendererRouter dispatches rendering by command prefix to business-domain renderers
  - 6 renderers: RoleRenderer, IndividualRenderer, OrgRenderer, PositionRenderer, ProjectRenderer, CensusRenderer
  - direct() returns rendered Markdown string; pass { raw: true } for structured data
  - census.list returns structured CommandResult; rendering moved to CensusRenderer
  - Remove CensusEntry type
  - MCP server requires zero changes — rendering happens in rolexjs layer

- 5cde1b1: Role rich domain model — merge prototype into core, Protocol export

  - Role is now a rich domain model in @rolexjs/core with ownership isolation, KV-serializable snapshot/restore, and all domain methods (want, plan, todo, finish, reflect, realize, master, etc.)
  - RoleXService orchestrates Role lifecycle, caching, and persistence in core
  - rolexjs becomes a thin rendering shell delegating to core's RoleXService
  - Protocol interface bundles tools + instructions as a single export for channel adapters
  - Removed scattered exports (render, genesis, createRendererRouter) from rolexjs public API
  - Deleted old Role class and RoleContext from rolexjs (replaced by core's Role)
  - Moved findInState utility to core

- 42f6d76: feat: unified tool schema in prototype — single source of truth for all tool definitions

  - Add `ToolDef` type and `tools` array in `@rolexjs/prototype` defining all 15 tool schemas
  - Add `worldInstructions` pre-assembled from world features
  - MCP server consumes unified schema instead of hand-written Zod definitions
  - Remove `instructions.ts` from mcp-server (now comes from prototype)
  - Re-export `ToolDef`, `tools`, `worldInstructions` from `rolexjs`

### Patch Changes

- ccef531: Make PrototypeRepository interface fully async. All methods now return Promises, enabling native async storage backends like Cloudflare D1.
- b4f08af: feat: replace additionalProperties with explicit args param for use/direct tools

  use and direct tools now accept an explicit `args` parameter (type: record) instead of
  relying on additionalProperties. This enforces progressive disclosure — AI sees the args
  field exists but must load the skill first to learn what to pass.

- 248cf65: feat: flatten use/direct MCP tool args

  Replace nested `args` object with flat top-level parameters for `use` and `direct` MCP tools.
  This eliminates the string/object serialization ambiguity when AI calls these tools.
  Updated all SKILL.md documentation to reflect the new flat parameter format.

- bf38ba4: Re-export genesis from rolexjs so consumers only need a single dependency.
- Updated dependencies [ccef531]
- Updated dependencies [fe28a2b]
- Updated dependencies [d5d6301]
- Updated dependencies [a6e717f]
- Updated dependencies [b968e76]
- Updated dependencies [6f19241]
- Updated dependencies [ffada31]
- Updated dependencies [5cde1b1]
  - @rolexjs/core@1.4.0
  - @rolexjs/genesis@1.4.0
  - @rolexjs/parser@1.4.0
  - @rolexjs/system@1.4.0

## 1.3.0

### Patch Changes

- Updated dependencies [23552e0]
  - @rolexjs/core@1.3.0
  - @rolexjs/prototype@1.3.0
  - @rolexjs/parser@1.3.0
  - @rolexjs/system@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [a2ad0d5]
  - @rolexjs/core@1.2.1
  - @rolexjs/prototype@1.2.1
  - @rolexjs/parser@1.2.1
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

- ca32e1c: fix(focus): reject non-goal ids passed to focus

  focus() now validates that the provided id is a goal node. Passing a plan, task, or other node type returns a clear error instead of silently corrupting the focused state.

- Updated dependencies [ca32e1c]
- Updated dependencies [ca32e1c]
- Updated dependencies [e35aa19]
  - @rolexjs/prototype@1.2.0
  - @rolexjs/core@1.2.0
  - @rolexjs/parser@1.2.0
  - @rolexjs/system@1.2.0

## 1.1.0

### Minor Changes

- 3de799b: Add resourcexExecutor to Platform interface for custom resolver execution

  Platform now accepts an optional CustomExecutor, passed through to ResourceX
  as isolator: "custom". Enables QuickJS Wasm execution in Workers environments.

### Patch Changes

- 051cfb2: fix(ci): restore workspace protocol replacement in release workflow
- Updated dependencies [3de799b]
  - @rolexjs/core@1.1.0
  - @rolexjs/prototype@1.1.0
  - @rolexjs/parser@1.1.0
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

- 4f4af27: feat: identity ethics and directive system for role boundaries

  Establish identity ethics as the foundational world instruction and build a directive system for enforcing role boundaries at critical decision points.

  - Add identity-ethics.feature as @priority-critical world description
  - Add priority sorting mechanism for world descriptions (critical > high > normal)
  - Build directive system (replaces reminders) with gen-directives.ts generator
  - Wire on-unknown-command directive into error handling
  - Remove nuwa.feature to prevent leaking world-building commands to all roles
  - Clean up use-protocol, census, and cognition to remove command knowledge leaks
  - Export directive() API from rolexjs

- f7147ad: Expand link targets in state projection — duties and charters now visible on activate
- e07c999: feat: realize and reflect accept empty source IDs

  Allow calling realize with no experience IDs and reflect with no encounter IDs. This enables direct creation of principles and experiences from conversational insights without requiring the full encounter → experience → principle chain.

  - ops.ts: skip resolve/remove when IDs are empty, directly create target node
  - role.ts: skip validation and consumption for empty IDs
  - MCP layer: pass undefined when IDs array is empty

- a96280c: refactor: remove requirement copy pattern from position.appoint

  - `position.appoint` no longer copies requirements as procedures onto the individual — requirements are rendered through position links instead, like organization charters
  - Unfold requirement nodes in `renderState` so their content (including skill locators) is visible

- 9882ecd: Rename @rolexjs/rolex-prototype to @rolexjs/genesis, consolidate descriptions into prototype package, and add direct tool for stateless world-level operations.
- 8449a59: refactor: Platform integrates ResourceXProvider instead of ResourceX

  Platform now declares `resourcexProvider?: ResourceXProvider` instead of `resourcex?: ResourceX`.
  Rolex internally creates the ResourceX instance from the injected provider.
  This makes the storage backend decision explicit at the Platform level —
  swapping providers is all that's needed to move from local to cloud deployment.

- c5a6d7d: Introduce RoleXRepository interface and SqliteRepository implementation. Platform now uses `repository` instead of separate runtime/prototype/saveContext/loadContext. Prototypes and contexts stored in SQLite instead of JSON files.
- 9180e24: Relax global ID uniqueness to same-parent idempotence, auto-train requirements as procedures on appoint, enhance error messages with skill-loading guidance, fix plan link rendering to compact references, and add goal progress summary in headings

### Patch Changes

- 260b06d: Expand link targets in SQLite runtime projection and fold requirement nodes by default
- 4240f6b: fix: validate required params in dispatch and filter empty nodes in render

  - Enforce required parameter validation in `toArgs` dispatch — missing required args now throw a clear error instead of silently passing `undefined` (#23)
  - Filter empty nodes (no id, no information, no children) in `renderState` to prevent cluttered activation output (#24)

- Updated dependencies [d7521ee]
- Updated dependencies [4240f6b]
- Updated dependencies [4f4af27]
- Updated dependencies [f7147ad]
- Updated dependencies [5ce5b98]
- Updated dependencies [e07c999]
- Updated dependencies [a9a1789]
- Updated dependencies [a96280c]
- Updated dependencies [9882ecd]
- Updated dependencies [8449a59]
- Updated dependencies [c5a6d7d]
- Updated dependencies [9180e24]
  - @rolexjs/system@1.0.0
  - @rolexjs/prototype@1.0.0
  - @rolexjs/core@1.0.0
  - @rolexjs/parser@1.0.0

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

## 0.10.0

### Minor Changes

- 17f21bd: feat: extract directory as standalone tool accessible to all roles

  Moved `directory` and `find` operations out of the nuwa-only `society` tool into a new standalone `directory` tool that any role can use. Query operations (list all, find by name) no longer require admin privileges.

### Patch Changes

- @rolexjs/core@0.10.0

## 0.9.1

### Patch Changes

- @rolexjs/core@0.9.1

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

- 59a8320: feat: enforce nuwa-only permission on society and organization tools

  - Add requireNuwa() guard that checks active role is nuwa
  - Society and organization tools return friendly denial message for non-nuwa roles
  - Add cognitive priority section to MCP server instructions

- Updated dependencies [99bcce5]
  - @rolexjs/core@0.9.0

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

## 0.7.0

### Minor Changes

- 33871d4: feat: add status bar to identity and focus tool output

  Displays current role, current goal, and timestamp at the top of
  identity and focus responses for quick context awareness.

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

## 0.6.0

### Minor Changes

- e537147: feat: add reflect() — distill experiences into knowledge

  Kantian Reflective Judgment: multiple concrete experiences are consumed
  and a transferable knowledge principle is created. Experience files are
  deleted, knowledge file is added to identity.

### Patch Changes

- Updated dependencies [e537147]
  - @rolexjs/core@0.6.0

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

## 0.4.1

### Patch Changes

- Updated dependencies [eec37ca]
  - @rolexjs/core@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [8fc5dfd]
  - @rolexjs/core@0.4.0

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

### Patch Changes

- Updated dependencies [fb2e6c6]
  - @rolexjs/core@0.3.0

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

### Patch Changes

- Updated dependencies [a3b4929]
  - @rolexjs/core@0.2.0

## 0.1.0

### Minor Changes

- 9b6a47b: feat: simplify roleType API
  - Export static `roleType` object instead of `createRoleType` factory
  - Remove registry dependency from `loadRoleSimple`
  - roleType is now stateless and can be used directly with any registry

### Patch Changes

- Updated dependencies [9b6a47b]
  - @rolexjs/core@0.1.0
