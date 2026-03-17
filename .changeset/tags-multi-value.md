---
"@rolexjs/system": minor
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
---

feat: multi-value tags — `tag: string` → `tags: string[]`

Structure.tag (single string) is replaced by Structure.tags (string array).
Runtime.tag() is replaced by Runtime.addTag() and Runtime.removeTag().

- Structure interface: `tag?: string` → `tags?: readonly string[]`
- Runtime: `tag(node, tag)` → `addTag(node, tag)` + `removeTag(node, tag)`
- Storage: DB column stays as `tag TEXT`, stores JSON array
- All renderers updated to render multiple tags as `#tag1 #tag2`
- Issue labels now use addTag/removeTag natively (no more comma-separated hack)
- Goal/plan/task status tags (done, abandoned) work unchanged
