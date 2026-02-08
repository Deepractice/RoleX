---
"@rolexjs/local-platform": patch
---

fix(local-platform): make reflect() transactional — write before erase

Previously, `reflect()` deleted experience files before creating the knowledge file. If knowledge creation failed, experiences would be permanently lost. Now the operation order is: validate all experiences exist → create knowledge → delete experiences. Also adds input validation for empty arrays and path traversal protection.
