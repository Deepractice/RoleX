---
"@rolexjs/core": minor
"@rolexjs/local-platform": minor
"rolexjs": minor
---

refactor: Platform integrates ResourceXProvider instead of ResourceX

Platform now declares `resourcexProvider?: ResourceXProvider` instead of `resourcex?: ResourceX`.
Rolex internally creates the ResourceX instance from the injected provider.
This makes the storage backend decision explicit at the Platform level —
swapping providers is all that's needed to move from local to cloud deployment.
