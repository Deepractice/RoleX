---
"@rolexjs/core": minor
"rolexjs": minor
---

feat: product created via project.produce with bidirectional relation

Product is no longer created independently — it is produced from a project.
Adds bidirectional relation: project → product (production) and product → project (origin).
Removes product.create command and publish lifecycle process.
