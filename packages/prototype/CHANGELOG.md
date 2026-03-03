# @rolexjs/prototype

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
