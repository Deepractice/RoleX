# @rolexjs/core

## 0.5.0

### Minor Changes

- 28b8b97: feat: enhance focus() to support multiple active goals and goal switching
  - Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
  - LocalPlatform: implement goal listing, .focus file for persistence
  - Role: focus(name?) returns current goal + other active goals
  - MCP server: focus tool accepts optional name param to switch goals

## 0.4.1

### Patch Changes

- eec37ca: Add bilingual README with MCP installation guide for 7 platforms

## 0.4.0

### Minor Changes

- 8fc5dfd: Extract LocalPlatform, pure bootstrap, fold MCP tools, unify package versions

## 0.3.0

### Minor Changes

- fb2e6c6: feat: extract LocalPlatform, pure bootstrap, folded MCP tools
  - Extract `@rolexjs/local-platform` as independent package
  - Pure `bootstrap(platform)` with build-time seed inlining (zero fs dependency)
  - 女娲 born at society level, not hired into any organization
  - `Rolex.role(name)` for direct society-level role access
  - Fold MCP society/organization operations into 2 admin tools (nuwa-only)
  - Unified Gherkin rendering layer (`renderFeature`/`renderFeatures`)
  - `teach` moved from Organization to Society (Rolex) level
  - Default storage at `~/.rolex`

## 0.2.0

### Minor Changes

- a3b4929: refactor: export roleType as BundledType for ResourceX integration
  - Add src/builtins/role.type.ts with resolve(ctx) logic
  - Modify build.ts to bundle role type into code string
  - Auto-generate roleType.ts with BundledType export
  - Fix loadRole and loadRoleSimple to use extract(rxr.archive)
  - Fix createResourceResolver to work without registry parameter
  - Remove old src/resource-type/ directory

  Now RoleX can be integrated with ResourceX via:

  ```typescript
  import { roleType } from "rolexjs";
  rx.supportType(roleType);
  ```

## 0.1.0

### Minor Changes

- 9b6a47b: feat: simplify roleType API
  - Export static `roleType` object instead of `createRoleType` factory
  - Remove registry dependency from `loadRoleSimple`
  - roleType is now stateless and can be used directly with any registry
