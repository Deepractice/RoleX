---
"@rolexjs/core": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
"@rolexjs/local-platform": minor
"@rolexjs/genesis": minor
---

Refactor to builder pattern with JSON-RPC 2.0 unified dispatch

- Replace async factory with synchronous `createRoleX()` builder — lazy initialization on first call
- Add 9 typed namespace APIs: society, org, position, project, product, census, issue, resource, role
- Add JSON-RPC 2.0 dispatch via `rx.rpc()` — uniform message format for cloud platform decoupling
- Add `rx.protocol` — self-describing tool schemas (name + description + params) for any channel adapter
- Inline description into `ToolDef` — no more separate `detail()` lookup
- Move genesis from platform config to built-in — `createRoleX({ platform })` auto-applies genesis
- Remove `prototypes` from Platform interface — Platform is now pure infrastructure
