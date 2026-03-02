---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
---

Introduce RoleXRepository interface and SqliteRepository implementation. Platform now uses `repository` instead of separate runtime/prototype/saveContext/loadContext. Prototypes and contexts stored in SQLite instead of JSON files.
