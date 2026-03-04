---
"rolexjs": patch
"@rolexjs/prototype": patch
"@rolexjs/mcp-server": patch
---

feat: flatten use/direct MCP tool args

Replace nested `args` object with flat top-level parameters for `use` and `direct` MCP tools.
This eliminates the string/object serialization ambiguity when AI calls these tools.
Updated all SKILL.md documentation to reflect the new flat parameter format.
