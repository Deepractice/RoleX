---
"@rolexjs/prototype": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: realize and reflect accept empty source IDs

Allow calling realize with no experience IDs and reflect with no encounter IDs. This enables direct creation of principles and experiences from conversational insights without requiring the full encounter → experience → principle chain.

- ops.ts: skip resolve/remove when IDs are empty, directly create target node
- role.ts: skip validation and consumption for empty IDs
- MCP layer: pass undefined when IDs array is empty
