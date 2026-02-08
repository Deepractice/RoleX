# rolexjs

## 0.7.0

### Minor Changes

- 33871d4: feat: add status bar to identity and focus tool output

  Displays current role, current goal, and timestamp at the top of
  identity and focus responses for quick context awareness.

- 71a8860: feat: unified error handling, society directory fix, workflow hints
  - Error handling: all tool errors render as structured markdown with
    tool name, error message, and pattern-matched actionable hints.
  - Society directory: `directory()` and `find()` now see all born roles,
    not just hired ones. Added `allBornRoles()` to Platform interface.
  - Workflow hints: every write operation returns a **Next** hint guiding
    the AI to the next logical step. Static hints in shared render layer,
    dynamic hints for `hire(name)` and `finish(remaining)`.

### Patch Changes

- Updated dependencies [71a8860]
  - @rolexjs/core@0.7.0

## 0.6.0

### Minor Changes

- e537147: feat: add reflect() — distill experiences into knowledge

  Kantian Reflective Judgment: multiple concrete experiences are consumed
  and a transferable knowledge principle is created. Experience files are
  deleted, knowledge file is added to identity.

### Patch Changes

- Updated dependencies [e537147]
  - @rolexjs/core@0.6.0

## 0.5.0

### Minor Changes

- 28b8b97: feat: enhance focus() to support multiple active goals and goal switching
  - Platform: add allActiveGoals(), getFocusedGoal(), setFocusedGoal()
  - LocalPlatform: implement goal listing, .focus file for persistence
  - Role: focus(name?) returns current goal + other active goals
  - MCP server: focus tool accepts optional name param to switch goals

### Patch Changes

- Updated dependencies [28b8b97]
  - @rolexjs/core@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [eec37ca]
  - @rolexjs/core@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [8fc5dfd]
  - @rolexjs/core@0.4.0

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

### Patch Changes

- Updated dependencies [fb2e6c6]
  - @rolexjs/core@0.3.0

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

### Patch Changes

- Updated dependencies [a3b4929]
  - @rolexjs/core@0.2.0

## 0.1.0

### Minor Changes

- 9b6a47b: feat: simplify roleType API
  - Export static `roleType` object instead of `createRoleType` factory
  - Remove registry dependency from `loadRoleSimple`
  - roleType is now stateless and can be used directly with any registry

### Patch Changes

- Updated dependencies [9b6a47b]
  - @rolexjs/core@0.1.0
