---
"@rolexjs/prototype": patch
"rolexjs": patch
---

fix: validate required params in dispatch and filter empty nodes in render

- Enforce required parameter validation in `toArgs` dispatch — missing required args now throw a clear error instead of silently passing `undefined` (#23)
- Filter empty nodes (no id, no information, no children) in `renderState` to prevent cluttered activation output (#24)
