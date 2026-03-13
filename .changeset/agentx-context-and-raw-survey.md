---
"@rolexjs/core": minor
"rolexjs": minor
"@rolexjs/agentx-context": minor
---

Add @rolexjs/agentx-context package and survey/inspect raw mode

- New package `@rolexjs/agentx-context`: RoleX ContextProvider bridge for AgentX runtime
  - RolexContext implements AgentX Context interface (schema, project, capabilities)
  - RolexContextProvider implements AgentX ContextProvider factory
  - Decouples RoleX from AgentX — AgentX no longer depends on rolexjs
- Add `raw` option to `survey()` and `inspect()` API
  - `survey({ type: "individual", raw: true })` returns `State[]` (structured JSON)
  - `inspect({ id: "nuwa", raw: true })` returns `State` (structured JSON)
  - Without `raw`, behavior unchanged (returns rendered text)
