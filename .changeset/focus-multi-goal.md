---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: enhance focus() to support multiple active goals and goal switching

- Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
- LocalPlatform: implement goal listing, .focus file for persistence
- Role: focus(name?) returns current goal + other active goals
- MCP server: focus tool accepts optional name param to switch goals
