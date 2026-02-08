---
"@rolexjs/mcp-server": patch
---

fix(mcp-server): support orgName parameter in hire operation

Previously, the `hire` operation always used the first organization, making it impossible to hire a role into a specific organization when multiple organizations exist. Now `hire` accepts an optional `orgName` parameter, and requires it when multiple organizations are present.
