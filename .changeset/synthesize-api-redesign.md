---
"@rolexjs/core": minor
"rolexjs": minor
"@rolexjs/local-platform": minor
"@rolexjs/mcp-server": minor
"@rolexjs/cli": minor
---

feat: plan lifecycle — complete/abandon operations for plans

- Add `complete` for plans — marks plan as done, creates encounter
- Move `abandon` from goal to plan — plans can be abandoned
- Remove `achieve` from goals — goals are long-term directions, use `forget` when done
- Three-layer verb separation: task→finish, plan→complete/abandon, goal→forget
- Update MCP tools, CLI commands, descriptions, and cognitive hints
- Refactor: rename growup to synthesize, string id API, teach/train injection
