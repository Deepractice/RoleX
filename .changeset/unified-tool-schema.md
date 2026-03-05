---
"@rolexjs/prototype": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: unified tool schema in prototype — single source of truth for all tool definitions

- Add `ToolDef` type and `tools` array in `@rolexjs/prototype` defining all 15 tool schemas
- Add `worldInstructions` pre-assembled from world features
- MCP server consumes unified schema instead of hand-written Zod definitions
- Remove `instructions.ts` from mcp-server (now comes from prototype)
- Re-export `ToolDef`, `tools`, `worldInstructions` from `rolexjs`
