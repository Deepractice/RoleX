---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"@rolexjs/agentx-context": minor
---

feat: purify RoleX — remove ResourceX, use, skill, and MCP server

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
