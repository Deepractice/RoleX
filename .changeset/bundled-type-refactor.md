---
"@rolexjs/core": minor
"rolexjs": minor
---

refactor: export roleType as BundledType for ResourceX integration

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
