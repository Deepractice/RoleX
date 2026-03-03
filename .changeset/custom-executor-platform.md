---
"@rolexjs/core": minor
"rolexjs": minor
---

Add resourcexExecutor to Platform interface for custom resolver execution

Platform now accepts an optional CustomExecutor, passed through to ResourceX
as isolator: "custom". Enables QuickJS Wasm execution in Workers environments.
