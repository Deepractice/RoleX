# @rolexjs/prototype

## 1.4.0

### Minor Changes

- 6be2390: refactor: census.list returns structured CommandResult instead of string

  - census.list now returns CommandResult with structured State tree
  - CensusRenderer handles org-tree Markdown rendering (moved from commands.ts)
  - Remove CensusEntry type (no longer needed)

- a6e717f: feat: add issue management as world instruction

  Issue management is now a built-in world instruction available to all roles,
  not just roles with the issue-management skill. This reflects that IssueX is
  a core collaboration primitive — enabling both self-collaboration across
  context breaks and inter-individual asynchronous coordination.

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

- Updated dependencies [ccef531]
- Updated dependencies [fe28a2b]
- Updated dependencies [d5d6301]
- Updated dependencies [a6e717f]
- Updated dependencies [b968e76]
- Updated dependencies [ffada31]
- Updated dependencies [5cde1b1]
  - @rolexjs/core@1.4.0
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

- Updated dependencies [23552e0]
  - @rolexjs/core@1.3.0
  - @rolexjs/parser@1.3.0
  - @rolexjs/system@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [a2ad0d5]
  - @rolexjs/core@1.2.1
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
- Updated dependencies [e35aa19]
  - @rolexjs/core@1.2.0
  - @rolexjs/parser@1.2.0
  - @rolexjs/system@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies [3de799b]
  - @rolexjs/core@1.1.0
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

- d7521ee: feat: enforce global ID uniqueness across the state tree

  - Both in-memory and SQLite runtimes now reject duplicate IDs with a clear error
  - Same ID under same parent remains idempotent (returns existing node)
  - Identity nodes now use `{id}-identity` suffix to avoid conflicting with individual ID

- 4f4af27: feat: identity ethics and directive system for role boundaries

  Establish identity ethics as the foundational world instruction and build a directive system for enforcing role boundaries at critical decision points.

  - Add identity-ethics.feature as @priority-critical world description
  - Add priority sorting mechanism for world descriptions (critical > high > normal)
  - Build directive system (replaces reminders) with gen-directives.ts generator
  - Wire on-unknown-command directive into error handling
  - Remove nuwa.feature to prevent leaking world-building commands to all roles
  - Clean up use-protocol, census, and cognition to remove command knowledge leaks
  - Export directive() API from rolexjs

- e07c999: feat: realize and reflect accept empty source IDs

  Allow calling realize with no experience IDs and reflect with no encounter IDs. This enables direct creation of principles and experiences from conversational insights without requiring the full encounter → experience → principle chain.

  - ops.ts: skip resolve/remove when IDs are empty, directly create target node
  - role.ts: skip validation and consumption for empty IDs
  - MCP layer: pass undefined when IDs array is empty

- a96280c: refactor: remove requirement copy pattern from position.appoint

  - `position.appoint` no longer copies requirements as procedures onto the individual — requirements are rendered through position links instead, like organization charters
  - Unfold requirement nodes in `renderState` so their content (including skill locators) is visible

- 9882ecd: Rename @rolexjs/rolex-prototype to @rolexjs/genesis, consolidate descriptions into prototype package, and add direct tool for stateless world-level operations.
- 9180e24: Relax global ID uniqueness to same-parent idempotence, auto-train requirements as procedures on appoint, enhance error messages with skill-loading guidance, fix plan link rendering to compact references, and add goal progress summary in headings

### Patch Changes

- 4240f6b: fix: validate required params in dispatch and filter empty nodes in render

  - Enforce required parameter validation in `toArgs` dispatch — missing required args now throw a clear error instead of silently passing `undefined` (#23)
  - Filter empty nodes (no id, no information, no children) in `renderState` to prevent cluttered activation output (#24)

- 5ce5b98: Add explicit instruction to never guess RoleX commands — only use commands seen in loaded skills or world descriptions.
- Updated dependencies [d7521ee]
- Updated dependencies [f7147ad]
- Updated dependencies [a9a1789]
- Updated dependencies [8449a59]
- Updated dependencies [c5a6d7d]
- Updated dependencies [9180e24]
  - @rolexjs/system@1.0.0
  - @rolexjs/core@1.0.0
  - @rolexjs/parser@1.0.0
