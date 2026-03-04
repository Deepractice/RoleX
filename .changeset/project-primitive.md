---
"rolexjs": minor
"@rolexjs/prototype": minor
"@rolexjs/core": minor
"@rolexjs/mcp-server": minor
---

feat: add Project as a top-level organizational primitive

- Add project structure with 5 sub-concepts: scope, milestone, deliverable, wiki, and participation relation
- Add 9 project operations: launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive
- Add project-render module for human-readable project output (compact member display, milestone progress)
- Add project lifecycle BDD feature with full test coverage
- Fix BDD test suite for async Runtime refactor (await createRoleX, Role methods, writeContext via SQLite)
