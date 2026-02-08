---
name: rolex-organization
description: >
  Organization-level operations for the Rolex RDD framework. Use when managing
  an organization's membership and development: hiring roles (hire), firing
  roles (fire), or teaching roles new knowledge/experience/voice (teach). These
  commands operate on the organizational relationship between the org and its
  roles.
---

# Organization Layer

Organization is the middle layer: **Society > Organization > Role**.

Organization manages membership and development. It answers: who works here? how do we grow them?

## Commands

### `rolex hire <name>`

Hire a role into the organization — establish the CAS link.

The role must already exist (created via `rolex born`). Hiring sets up the organizational working structure so the role can receive goals, plans, and tasks.

```bash
rolex hire sean
```

Flow: `born(name, source)` > `hire(name)` > `identity(name)` > focus/want/plan/todo

### `rolex fire <name>`

Fire a role from the organization — remove the CAS link.

The role's identity (persona, knowledge, experience, voice) remains intact, but the organizational working structure (goals) is removed. The role can be re-hired later.

```bash
rolex fire sean
```

### `rolex teach <name> <type> <dimensionName> [--source <gherkin>] [-f <file>]`

Teach a role — add knowledge, experience, or voice from the organization's perspective.

Same as `growup` but called from the outside. Use when the organization is developing a role's capabilities.

**Growth dimensions:**

- `knowledge` — Domain expertise, mental models, patterns, principles
- `experience` — Background, career history, project context
- `voice` — The distinctive way this role's character comes through in expression

```bash
rolex teach sean knowledge distributed-systems \
  -f distributed-systems.feature

rolex teach sean experience startup-years \
  --source 'Feature: Startup Years
    Scenario: Early-stage product development
      Given I spent 3 years building MVPs
      Then I learned to ship fast and iterate'
```

## Flow

```
hire(name) → teach(name, type, dimensionName, source) → fire(name)
```

Organization manages the relationship. For the role's own first-person operations, move to the Role layer (`rolex identity/focus/want/...`).
