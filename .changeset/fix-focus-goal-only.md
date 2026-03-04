---
"rolexjs": patch
"@rolexjs/prototype": patch
---

fix(focus): reject non-goal ids passed to focus

focus() now validates that the provided id is a goal node. Passing a plan, task, or other node type returns a clear error instead of silently corrupting the focused state.
