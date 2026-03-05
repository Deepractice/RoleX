---
"@rolexjs/prototype": minor
"rolexjs": minor
---

refactor: census.list returns structured CommandResult instead of string

- census.list now returns CommandResult with structured State tree
- CensusRenderer handles org-tree Markdown rendering (moved from commands.ts)
- Remove CensusEntry type (no longer needed)
