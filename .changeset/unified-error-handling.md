---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: unified error handling, society directory fix, workflow hints

- Error handling: all tool errors render as structured markdown with
  tool name, error message, and pattern-matched actionable hints.
- Society directory: `directory()` and `find()` now see all born roles,
  not just hired ones. Added `allBornRoles()` to Platform interface.
- Workflow hints: every write operation returns a **Next** hint guiding
  the AI to the next logical step. Static hints in shared render layer,
  dynamic hints for `hire(name)` and `finish(remaining)`.
