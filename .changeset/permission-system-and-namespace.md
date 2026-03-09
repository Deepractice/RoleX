---
"@rolexjs/core": minor
"rolexjs": minor
"@rolexjs/genesis": minor
---

feat: multi-layer permission system and namespace redesign

- Rename `individual.*` and `org.found/dissolve` commands to `society.*` namespace
- Add 4-layer permission system: sovereign, org-admin, project-maintainer, product-owner
- PermissionRegistry maps reverse relation names to permission arrays, injected at projection time
- New commands: `org.admin/unadmin`, `project.maintain/unmaintain`
- Add `.feature` description files with Parameters scenarios for all commands
- V5 migration: make Nuwa an independent sovereign individual, dissolve rolex org
- compactRelations updated to include new reverse relations (administer, maintained-by, own)
