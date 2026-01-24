---
"rolexjs": minor
"@rolexjs/core": minor
---

feat: simplify roleType API

- Export static `roleType` object instead of `createRoleType` factory
- Remove registry dependency from `loadRoleSimple`
- roleType is now stateless and can be used directly with any registry
