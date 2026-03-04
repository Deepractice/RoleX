---
"@rolexjs/core": minor
"@rolexjs/prototype": minor
---

feat: add bidirectional ownership relation between project and organization

- Add ownership relation on project structure pointing to organization
- project.launch accepts optional `org` parameter to link project to an organization
- census.list tree view displays projects under their owning organization
- Add BDD scenario and link assertion step for ownership verification
