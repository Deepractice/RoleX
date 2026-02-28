---
"@rolexjs/system": minor
"@rolexjs/local-platform": minor
"@rolexjs/prototype": minor
---

feat: enforce global ID uniqueness across the state tree

- Both in-memory and SQLite runtimes now reject duplicate IDs with a clear error
- Same ID under same parent remains idempotent (returns existing node)
- Identity nodes now use `{id}-identity` suffix to avoid conflicting with individual ID
