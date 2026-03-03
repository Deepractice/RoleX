---
"@rolexjs/prototype": minor
"rolexjs": minor
---

refactor: remove requirement copy pattern from position.appoint

- `position.appoint` no longer copies requirements as procedures onto the individual — requirements are rendered through position links instead, like organization charters
- Unfold requirement nodes in `renderState` so their content (including skill locators) is visible
