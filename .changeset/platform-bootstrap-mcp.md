---
"rolexjs": minor
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"@rolexjs/mcp-server": minor
"@rolexjs/cli": minor
"@rolexjs/parser": patch
---

feat: extract LocalPlatform, pure bootstrap, folded MCP tools

- Extract `@rolexjs/local-platform` as independent package
- Pure `bootstrap(platform)` with build-time seed inlining (zero fs dependency)
- 女娲 born at society level, not hired into any organization
- `Rolex.role(name)` for direct society-level role access
- Fold MCP society/organization operations into 2 admin tools (nuwa-only)
- Unified Gherkin rendering layer (`renderFeature`/`renderFeatures`)
- `teach` moved from Organization to Society (Rolex) level
- Default storage at `~/.rolex`
