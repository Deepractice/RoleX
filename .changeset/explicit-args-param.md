---
"rolexjs": patch
"@rolexjs/prototype": patch
"@rolexjs/mcp-server": patch
---

feat: replace additionalProperties with explicit args param for use/direct tools

use and direct tools now accept an explicit `args` parameter (type: record) instead of
relying on additionalProperties. This enforces progressive disclosure — AI sees the args
field exists but must load the skill first to learn what to pass.
