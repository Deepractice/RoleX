---
"@rolexjs/core": minor
"@rolexjs/prototype": minor
"@rolexjs/genesis": major
"@rolexjs/local-platform": minor
"@rolexjs/mcp-server": minor
"rolexjs": minor
---

Implement Flyway-style prototype migration system. Prototypes now support incremental versioned migrations — only unapplied migrations execute on restart.

- Add `PrototypeData`, `Migration` types and `applyPrototype()` function
- Rename `PrototypeRegistry` to `PrototypeRepository`
- Add `version` column to `prototype_migrations` table
- Remove `prototype.settle` MCP instruction (now internal-only)
- Convert genesis from ResourceX resource to TS module with inline migrations
- Replace `Platform.bootstrap` (string[]) with `Platform.prototypes` (PrototypeData[])
