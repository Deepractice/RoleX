# @rolexjs/mcp-server

## 0.10.0

### Minor Changes

- 17f21bd: feat: extract directory as standalone tool accessible to all roles

  Moved `directory` and `find` operations out of the nuwa-only `society` tool into a new standalone `directory` tool that any role can use. Query operations (list all, find by name) no longer require admin privileges.

### Patch Changes

- Updated dependencies [17f21bd]
  - rolexjs@0.10.0
  - @rolexjs/local-platform@0.10.0

## 0.9.1

### Patch Changes

- 54c96f6: fix(mcp-server): support orgName parameter in hire operation

  Previously, the `hire` operation always used the first organization, making it impossible to hire a role into a specific organization when multiple organizations exist. Now `hire` accepts an optional `orgName` parameter, and requires it when multiple organizations are present.

- Updated dependencies [3bb910b]
  - @rolexjs/local-platform@0.9.1
  - rolexjs@0.9.1

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

- Updated dependencies [59a8320]
- Updated dependencies [99bcce5]
  - rolexjs@0.9.0
  - @rolexjs/local-platform@0.9.0

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
  - @rolexjs/local-platform@0.8.0
  - rolexjs@0.8.0

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

- Updated dependencies [33871d4]
- Updated dependencies [71a8860]
  - rolexjs@0.7.0
  - @rolexjs/local-platform@0.7.0

## 0.6.0

### Minor Changes

- e537147: feat: add reflect() — distill experiences into knowledge

  Kantian Reflective Judgment: multiple concrete experiences are consumed
  and a transferable knowledge principle is created. Experience files are
  deleted, knowledge file is added to identity.

### Patch Changes

- Updated dependencies [e537147]
  - @rolexjs/local-platform@0.6.0
  - rolexjs@0.6.0

## 0.5.0

### Minor Changes

- 28b8b97: feat: enhance focus() to support multiple active goals and goal switching
  - Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
  - LocalPlatform: implement goal listing, .focus file for persistence
  - Role: focus(name?) returns current goal + other active goals
  - MCP server: focus tool accepts optional name param to switch goals

### Patch Changes

- Updated dependencies [28b8b97]
  - @rolexjs/local-platform@0.5.0
  - rolexjs@0.5.0

## 0.4.1

### Patch Changes

- @rolexjs/local-platform@0.4.1
- rolexjs@0.4.1

## 0.4.0

### Patch Changes

- @rolexjs/local-platform@0.4.0
- rolexjs@0.4.0

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
  - rolexjs@0.3.0
  - @rolexjs/local-platform@0.2.0
