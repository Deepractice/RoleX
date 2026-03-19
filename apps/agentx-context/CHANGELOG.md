# @rolexjs/agentx-context

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

### Patch Changes

- b585451: fix: add `use` tool routing in RolexContext

  The `use` tool was not handled in `executeTool`'s switch, causing it to fall through
  to the generic `role.${name}` path and fail with "Unknown instruction role.use".
  Now routes `use` calls to `Role.use()` for proper subjective execution.

- Updated dependencies [58bcb9b]
- Updated dependencies [96967bc]
- Updated dependencies [2886169]
- Updated dependencies [d5ee5ab]
- Updated dependencies [2494ba2]
- Updated dependencies [b8a5ca6]
- Updated dependencies [8c1db15]
  - rolexjs@1.5.0
