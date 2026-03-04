---
"@rolexjs/core": patch
---

Remove "bun" export condition from all packages

The "bun" condition in exports pointed to ./src/index.ts which is not included in published npm packages, causing "Cannot find package" errors when consumed by bun runtime. All environments now use the compiled dist/ output.
