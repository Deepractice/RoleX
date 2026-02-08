---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: RolexConfig as CAS source of truth, waiter default role

- Add `RolexConfig` and `OrganizationConfig` types to core
- rolex.json is now the single source of truth (CAS): `{ roles, organization }`
- `born()` registers role in config.roles — no directory scanning needed
- `loadConfig()` always returns valid config (auto-creates default)
- Organization is optional (`organization: null` when no org founded)
- Add waiter/小二 as default onboarding role (auto-activated on MCP startup)
- Fix null-safety for `organization()` across Rolex, Organization, MCP server
- Remove old seed rolex.json (generate-seed.ts scans directories at build time)
- Update tests for new RolexConfig format and focus() multi-goal API
