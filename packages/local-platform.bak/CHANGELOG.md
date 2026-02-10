# @rolexjs/local-platform

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
