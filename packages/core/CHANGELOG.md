# @rolexjs/core

## 0.1.0

### Minor Changes

- 9b6a47b: feat: simplify roleType API
  - Export static `roleType` object instead of `createRoleType` factory
  - Remove registry dependency from `loadRoleSimple`
  - roleType is now stateless and can be used directly with any registry
