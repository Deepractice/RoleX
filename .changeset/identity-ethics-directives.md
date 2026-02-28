---
"@rolexjs/prototype": minor
"rolexjs": minor
---

feat: identity ethics and directive system for role boundaries

Establish identity ethics as the foundational world instruction and build a directive system for enforcing role boundaries at critical decision points.

- Add identity-ethics.feature as @priority-critical world description
- Add priority sorting mechanism for world descriptions (critical > high > normal)
- Build directive system (replaces reminders) with gen-directives.ts generator
- Wire on-unknown-command directive into error handling
- Remove nuwa.feature to prevent leaking world-building commands to all roles
- Clean up use-protocol, census, and cognition to remove command knowledge leaks
- Export directive() API from rolexjs
