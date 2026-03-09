---
"@rolexjs/core": minor
"@rolexjs/prototype": minor
"rolexjs": minor
"@rolexjs/mcp-server": minor
---

feat: add product management system

Add product management as a new entity type in RoleX, enabling vision, strategy,
behavior contracts (BDD specs), releases, channels, and ownership tracking.

New commands:
- `!product.create` — create a product with vision
- `!product.strategy` — define product strategy
- `!product.spec` — add behavior contract (BDD specification)
- `!product.release` — publish a version release
- `!product.channel` — add distribution channel
- `!product.own` / `!product.disown` — manage product ownership
- `!product.deprecate` — deprecate a product
