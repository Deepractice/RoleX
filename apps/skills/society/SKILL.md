---
name: rolex-society
description: >
  Society-level operations for the Rolex RDD framework. Use when managing the
  top-level society: creating roles (born), founding organizations (found),
  listing all known entities (directory), or looking up a role/organization by
  name (find). These are the entry-point commands before working with
  organizations or individual roles.
---

# Society Layer

Society is the top level of the Rolex three-layer architecture: **Society > Organization > Role**.

Society manages the existence of people and organizations. It answers: who exists? what organizations are there?

## Commands

### `rolex born <name> [--source <gherkin>] [-f <file>]`

Create a new role with its persona.

Persona is the foundational identity — who this person IS at the most essential level: character, temperament, thinking patterns. No job title, no professional skills — those come later through teach/growup.

```bash
rolex born sean --source 'Feature: Alex
  Scenario: How I communicate
    Given I prefer direct, concise language
    Then I get to the point quickly'

rolex born sean -f persona.feature
```

After born, the role exists as an individual. Call `rolex hire` to bring them into the organization.

### `rolex found <name>`

Found an organization — register it in society.

Creates the organization config. An organization must exist before roles can be hired into it.

```bash
rolex found Deepractice
```

### `rolex directory`

List all known roles and organizations in this society.

No arguments. Returns every born role (with ID) and every founded organization (with name).

```bash
rolex directory
```

### `rolex find <name>`

Find a role or organization by name.

Returns details about the matched entity. Throws if the name doesn't match any known role or organization.

```bash
rolex find sean          # finds role
rolex find Deepractice   # finds organization
```

## Flow

```
born(name, source) → found(orgName) → directory() / find(name)
```

Society creates individuals and organizations. To manage membership, move to the Organization layer (`rolex hire/fire/teach`).
