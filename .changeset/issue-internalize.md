---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
---

feat: internalize issue into graph — remove IssueX dependency

Issues are now first-class graph nodes under society, no longer stored in external IssueX.

- Add `issue` and `comment` structure types with author/assignee relations
- Rewrite all issue.* commands to use graph operations (rt.create, rt.tag, rt.link)
- Issue status uses tags (#open / #closed), number uses auto-increment id pattern
- Comments are child nodes of issues, authors linked via relations
- Remove all IssueX dependencies (@issuexjs/core, issuexjs, @issuexjs/node)
- Remove issue-render.ts — issues now return CommandResult through standard renderer
- Remove outdated prototype migration BDD tests (relied on unregistered RPC methods)
- Platform interface fully simplified: only repository + initializer remain
