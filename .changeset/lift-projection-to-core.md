---
"@rolexjs/core": patch
"@rolexjs/system": patch
"@rolexjs/local-platform": patch
"rolexjs": patch
---

refactor: lift compactRelations and projection logic from platform to core

- Remove duplicated compactRelations from in-memory runtime and SQLite runtime
- Add `compactState` post-processing in core's RoleXService (raw → compact → enrich)
- Runtime.project() now returns raw trees; all business logic applied uniformly in core
- Fixes online society service returning explosively large output (117K chars)
