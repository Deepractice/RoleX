---
"@rolexjs/core": patch
"@rolexjs/prototype": patch
"@rolexjs/local-platform": patch
"rolexjs": patch
---

Make PrototypeRepository interface fully async. All methods now return Promises, enabling native async storage backends like Cloudflare D1.
