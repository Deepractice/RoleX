---
"@rolexjs/mcp-server": patch
"rolexjs": patch
---

feat: enforce nuwa-only permission on society and organization tools

- Add requireNuwa() guard that checks active role is nuwa
- Society and organization tools return friendly denial message for non-nuwa roles
- Add cognitive priority section to MCP server instructions
