---
"@rolexjs/core": minor
"rolexjs": minor
"@rolexjs/mcp-server": patch
---

Role rich domain model — merge prototype into core, Protocol export

- Role is now a rich domain model in @rolexjs/core with ownership isolation, KV-serializable snapshot/restore, and all domain methods (want, plan, todo, finish, reflect, realize, master, etc.)
- RoleXService orchestrates Role lifecycle, caching, and persistence in core
- rolexjs becomes a thin rendering shell delegating to core's RoleXService
- Protocol interface bundles tools + instructions as a single export for channel adapters
- Removed scattered exports (render, genesis, createRendererRouter) from rolexjs public API
- Deleted old Role class and RoleContext from rolexjs (replaced by core's Role)
- Moved findInState utility to core
