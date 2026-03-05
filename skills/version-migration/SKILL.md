---
name: version-migration
description: Migrate legacy RoleX data (pre-1.0) to RoleX 1.0. Use when a user has old data in ~/.rolex and needs to migrate individuals, organizations, and positions to the new version.
---

Feature: Version Migration Overview
  Migrate pre-1.0 RoleX data to the current version.
  The old format stores data as Gherkin feature files in ~/.rolex/.
  The new format uses a structured graph via RoleX runtime commands.

  Scenario: When to use this skill
    Given a user mentions migrating from an old RoleX version
    Or a user has data in ~/.rolex that needs to be brought forward
    When they want to preserve their roles, organizations, and knowledge
    Then load this skill and follow the migration process

  Scenario: Migration is non-destructive
    Given the old data lives in ~/.rolex
    When migration runs
    Then old files are only read, never modified or deleted
    And new entities are created in the current RoleX runtime
    And the user can verify before cleaning up old data

Feature: Legacy Data Format (pre-1.0)
  Understanding the old directory structure and file conventions.

  Scenario: Root directory structure
    Given the legacy data lives at ~/.rolex/
    Then the structure is:
      """
      ~/.rolex/
      ├── rolex.json                    # Root manifest
      ├── .seed-version                 # Version string (e.g. "0.11.0")
      └── roles/
          ├── <role-name>/
          │   ├── identity/
          │   │   ├── persona.identity.feature        # Who this role is
          │   │   └── *.knowledge.identity.feature    # Knowledge files
          │   └── goals/                              # Goal files (if any)
          └── <another-role>/
              └── ...
      """

  Scenario: rolex.json manifest
    Given rolex.json is the root manifest
    Then it contains:
      """
      {
        "roles": ["nuwa", "waiter"],       // List of role names
        "organizations": {},               // Organization definitions
        "assignments": {}                  // Role-to-org assignments
      }
      """
    And roles array lists all individuals to migrate
    And organizations object may contain org definitions with charters
    And assignments object may contain role-to-position mappings

  Scenario: Persona files
    Given a file named persona.identity.feature exists per role
    Then it contains a Gherkin Feature defining who the role is
    And the Feature title is the role's name
    And Scenarios describe personality, thinking style, and behavior
    And this maps to the individual's identity content in new format

  Scenario: Knowledge files
    Given files named *.knowledge.identity.feature exist per role
    Then each file contains a Gherkin Feature with domain knowledge
    And the filename prefix (before .knowledge) is the knowledge topic
    And these map to principles (teach) in the new format
    And the knowledge id is derived from the filename prefix

  Scenario: Goal files
    Given a goals/ directory may exist per role
    Then it may contain Gherkin files representing active goals
    And goals can be recreated via want in the new format
    And goals are optional — many roles have empty goals directories

Feature: Migration Process
  Step-by-step process to migrate legacy data.

  Scenario: Step 1 — Scan and analyze
    Given the user wants to migrate
    When you begin the migration process
    Then read ~/.rolex/rolex.json to get the manifest
    And list all roles from the roles array
    And for each role, read all files under identity/ and goals/
    And present a summary to the user:
      """
      Found X roles to migrate:
      - <role-name>: persona + N knowledge files + M goals
      - <role-name>: persona + N knowledge files + M goals

      Organizations: X
      Assignments: X
      """
    And ask the user to confirm before proceeding

  Scenario: Step 2 — Migrate individuals
    Given the user confirmed migration
    When migrating each role from the manifest
    Then for each role:
      """
      command: "!individual.born"
      args:
        id: "<role-name>"
        content: "<persona feature content>"
      """
    And the role-name from the directory becomes the individual id

  Scenario: Step 3 — Migrate knowledge to principles
    Given an individual has been born
    When migrating their knowledge files
    Then for each *.knowledge.identity.feature file:
      """
      1. Extract topic from filename: "role-creation.knowledge.identity.feature" → "role-creation"
      2. Read the file content (Gherkin Feature)
      3. command: "!individual.teach"
         args:
           individual: "<role-name>"
           content: "<knowledge feature content>"
           id: "<topic>"
      """
    And each knowledge file becomes one principle

  Scenario: Step 4 — Migrate organizations
    Given rolex.json contains organization definitions
    When the organizations object is not empty
    Then for each organization:
      """
      1. command: "!org.found"
         args:
           id: "<org-id>"
           content: "<org feature content>"
      2. If charter exists:
         command: "!org.charter"
         args:
           org: "<org-id>"
           content: "<charter content>"
      """

  Scenario: Step 5 — Migrate assignments (membership + appointments)
    Given rolex.json contains assignment mappings
    When the assignments object is not empty
    Then for each assignment:
      """
      1. command: "!org.hire"
         args:
           org: "<org-id>"
           individual: "<role-name>"
      2. If position exists:
         command: "!position.appoint"
         args:
           position: "<position-id>"
           individual: "<role-name>"
      """

  Scenario: Step 6 — Migrate goals (optional)
    Given a role has files in goals/ directory
    When the user wants to preserve active goals
    Then for each goal file:
      """
      1. Read the goal Gherkin content
      2. Activate the individual with roleId: "<role-name>"
      3. Call want with goal: "<goal content>", id: "<goal-id>"
      """
    And goal ids are derived from the goal filename

  Scenario: Step 7 — Verify migration
    Given all entities have been migrated
    When verification is needed
    Then activate each migrated individual and check:
      """
      1. Activate with roleId: "<role-name>"
      2. Verify identity content matches the old persona
      3. Verify principles match the old knowledge files
      4. Verify organization memberships if applicable
      """
    And present the verification results to the user

Feature: Entity Mapping Reference
  How old format entities map to new format commands.

  Scenario: Individual mapping
    Given an old role directory exists
    Then the mapping is:
      """
      Old: roles/<name>/identity/persona.identity.feature
      New: command: "!individual.born", args: { id: "<name>", content: "<persona>" }
      """

  Scenario: Knowledge mapping
    Given old knowledge files exist
    Then the mapping is:
      """
      Old: roles/<name>/identity/<topic>.knowledge.identity.feature
      New: command: "!individual.teach", args: { individual: "<name>", content: "<knowledge>", id: "<topic>" }
      """

  Scenario: Organization mapping
    Given old organization definitions exist in rolex.json
    Then the mapping is:
      """
      Old: rolex.json → organizations.<id>
      New: command: "!org.found", args: { id: "<id>", content: "<org content>" }
           command: "!org.charter", args: { org: "<id>", content: "<charter>" }
      """

  Scenario: Assignment mapping
    Given old assignments exist in rolex.json
    Then the mapping is:
      """
      Old: rolex.json → assignments.<role>.<org>
      New: command: "!org.hire", args: { org: "<org>", individual: "<role>" }
           command: "!position.appoint", args: { position: "<pos>", individual: "<role>" }
      """

Feature: Edge Cases and Troubleshooting

  Scenario: Role already exists in new version
    Given an individual with the same id already exists
    When born is called with the same id
    Then it will fail with a duplicate id error
    And skip this individual and inform the user
    And suggest using teach to update knowledge if needed

  Scenario: Empty goals directory
    Given a role's goals/ directory is empty
    Then skip goal migration for this role
    And this is normal — many roles start without goals

  Scenario: Unknown file patterns
    Given files don't match expected naming conventions
    Then log the unrecognized files for user review
    And do not attempt to auto-migrate unknown formats
    And present them to the user for manual decision

  Scenario: Custom data directory
    Given the user's legacy data is not at ~/.rolex
    When the user provides a custom path
    Then use that path instead of ~/.rolex
    And all other steps remain the same
