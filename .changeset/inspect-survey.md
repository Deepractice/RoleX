---
"@rolexjs/core": minor
"rolexjs": minor
---

Add inspect and survey as top-level perception tools

- `inspect(id)`: project any node's full subtree, works on any node type
- `survey(type?)`: world-level overview replacing census via direct
- Extract `projectById` as shared structural primitive in RoleXService
- Add InspectRenderer for generic node tree rendering
- Replace census.feature with survey.feature
- Fix gen-descriptions to quote hyphenated object keys
