---
name: rolex-role
description: >
  Role-level (first-person) operations for the Rolex RDD framework. Use when
  operating as an individual role: loading identity, growing capabilities,
  checking focus, setting goals (want), making plans, creating tasks (todo),
  achieving/abandoning goals, and finishing tasks. This is the embodied
  perspective — "I" am the role.
---

# Role Layer

Role is the innermost layer: **Society > Organization > Role**.

Role operates in first person. Everything here is "I" — my identity, my goals, my plan, my tasks.

## Identity

### `rolex identity <name>`

Load my identity — this is who I am.

Must be called first. Without identity, no sense of self. Returns all identity features: persona, knowledge, experience, voice.

```bash
rolex identity alex
```

After loading, prefix responses with role name in brackets (e.g. `[Alex]`).

### `rolex growup <name> <type> <dimensionName> [--source <gherkin>] [-f <file>]`

I'm growing. Add a new dimension to my identity.

**Dimensions:** `knowledge`, `experience`, `voice`

```bash
rolex growup alex knowledge cap-theorem \
  -f cap-theorem.feature
```

## Goal Lifecycle

### `rolex focus <name>`

What am I focused on? Returns my current active goal with plan and tasks.

If no active goal, use the ISSUE method to collaborate with the user on what to work on next.

```bash
rolex focus alex
```

### `rolex want <name> <goalName> [--source <gherkin>] [-f <file>] [--testable]`

I want to achieve this. Create a new goal.

A Goal describes WHAT to achieve. Feature name = objective, Scenarios = success criteria.

```bash
rolex want alex user-auth \
  --source 'Feature: User Authentication System
    Scenario: Users can register with email
      Given a new user with valid email
      When they submit registration
      Then an account is created' \
  --testable
```

### `rolex plan <name> [--source <gherkin>] [-f <file>]`

Here's how I'll do it. Create a plan for my current active goal.

A Plan describes HOW to achieve the goal. Scenarios = sequential phases.

```bash
rolex plan alex -f auth-plan.feature
```

### `rolex todo <name> <taskName> [--source <gherkin>] [-f <file>] [--testable]`

I need to do this. Create a task for my current active goal.

A Task is a concrete, actionable unit of work.

```bash
rolex todo alex implement-registration \
  -f registration-task.feature --testable
```

### `rolex finish <name> <taskName>`

Task finished. Mark a task as completed by name.

```bash
rolex finish alex implement-registration
```

### `rolex achieve <name> [--source <gherkin>] [-f <file>]`

Goal achieved. Mark my current active goal as completed.

Optional experience reflection auto-grows identity.

```bash
rolex achieve alex

rolex achieve alex --source 'Feature: Auth Lessons
  Scenario: JWT refresh tokens are essential
    Given long-lived tokens
    Then they become a security risk'
```

### `rolex abandon <name> [--source <gherkin>] [-f <file>]`

Goal abandoned. Mark my current active goal as abandoned.

Optional experience reflection captures what was learned. Abandoning is not failure — it is learning.

```bash
rolex abandon alex
```

## Flow

```
identity(name) → focus() → want(goalName, source) → plan(source) → todo(taskName, source) → finish(taskName) → achieve()
```

This is a continuous cycle: identity grounds me, goals direct me, plans guide me, tasks move me forward.
