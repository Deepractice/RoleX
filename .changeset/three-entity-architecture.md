---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: three-entity architecture (Role, Organization, Position)

- Role (WHO), Organization (WHERE), Position (WHAT) as independent entities
- State machines: free → member → on_duty, vacant → filled
- New API: establish(), appoint(), dismiss() for position management
- Gherkin-defined duties inject into identity at runtime
- New directory structure: roles/<name>/, orgs/<org>/positions/<pos>/
- Auto-dismiss on fire, one-to-one constraints
- Updated nuwa seed with three-entity knowledge
