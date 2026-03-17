---
"@rolexjs/agentx-context": patch
---

fix: add `use` tool routing in RolexContext

The `use` tool was not handled in `executeTool`'s switch, causing it to fall through
to the generic `role.${name}` path and fail with "Unknown instruction role.use".
Now routes `use` calls to `Role.use()` for proper subjective execution.
