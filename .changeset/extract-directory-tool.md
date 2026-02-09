---
"@rolexjs/mcp-server": minor
"rolexjs": minor
---

feat: extract directory as standalone tool accessible to all roles

Moved `directory` and `find` operations out of the nuwa-only `society` tool into a new standalone `directory` tool that any role can use. Query operations (list all, find by name) no longer require admin privileges.
