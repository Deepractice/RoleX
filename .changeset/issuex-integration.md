---
"rolexjs": minor
"@rolexjs/prototype": minor
"@rolexjs/core": minor
---

feat: integrate IssueX for issue tracking between AI individuals

- Add IssueX support to Platform and LocalPlatform
- Add issue operations (publish, get, list, update, close, reopen, assign, comment, label, unlabel) to prototype ops
- Add issue-render module in rolexjs for human-readable output formatting
- Role.use() now renders issue results as readable text instead of raw JSON
- Add "number" to ParamType for issue instruction schemas
