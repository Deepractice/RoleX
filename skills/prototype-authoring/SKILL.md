---
name: prototype-authoring
description: Author prototype packages — create the directory structure, prototype.json instruction set, and .feature content files. Use when creating a new role or organization prototype from scratch.
---

Feature: Prototype Directory Structure
  A prototype is a directory containing an instruction set and content files.
  When settled, each instruction is executed against the RoleX runtime in order.

  Scenario: Required files
    Given a prototype directory (e.g. ./prototypes/my-prototype)
    Then it must contain:
      """
      resource.json       — ResourceX manifest (name, type, author, description)
      prototype.json      — Instruction set (JSON array of ops)
      *.feature           — Gherkin content files referenced by @filename in prototype.json
      """

  Scenario: resource.json format
    Given the resource manifest identifies this as a prototype
    Then it looks like:
      """json
      {
        "name": "my-prototype",
        "type": "prototype",
        "author": "deepractice",
        "description": "Short description of what this prototype creates"
      }
      """
    And "name" becomes the prototype id used in the registry
    And "type" must be "prototype"

Feature: Instruction Set — prototype.json
  The instruction set is a JSON array of operations.
  Each operation has an "op" (the RoleX command) and "args" (named parameters).
  Content args use @filename references to .feature files in the same directory.

  Scenario: Instruction format
    Given each instruction is an object with op and args
    Then the format is:
      """json
      { "op": "!namespace.method", "args": { "key": "value", "content": "@filename.feature" } }
      """
    And "op" is a RoleX command prefixed with "!"
    And args starting with "@" are resolved to file contents at settle time

  Scenario: Available operations for prototypes
    Given prototypes can use any runtime operation
    Then common operations are:
      """
      !individual.born    — Create an individual      (id, alias?, content?)
      !individual.train   — Train a procedure          (individual, id, content)
      !individual.teach   — Teach a principle           (individual, id, content)
      !org.found          — Found an organization       (id, alias?, content?)
      !org.charter        — Set organization charter    (org, id, content)
      !org.hire           — Hire individual into org    (org, individual)
      !position.establish — Establish a position        (id, content?)
      !position.charge    — Add a duty to position      (position, id, content)
      !position.require   — Add a skill requirement     (position, id, content)
      !position.appoint   — Appoint individual to pos   (position, individual)
      """

  Scenario: Instruction ordering matters
    Given instructions execute in array order
    Then follow this order:
      """
      1. Born individuals (they must exist before being trained, hired, or appointed)
      2. Train/teach individuals
      3. Found organizations
      4. Charter organizations
      5. Hire individuals into organizations
      6. Establish positions
      7. Charge duties and require skills on positions
      8. Appoint individuals to positions
      """

Feature: Content Files — .feature format
  Content files are Gherkin Feature files referenced by @filename in prototype.json.

  Scenario: Naming convention
    Given content files live in the prototype directory root
    Then use this naming pattern:
      """
      {id}.individual.feature       — Individual identity
      {id}.organization.feature     — Organization description
      {id}.procedure.feature        — Procedure (skill metadata)
      {id}.charter.feature          — Organization charter
      {id}.position.feature         — Position description
      {id}.duty.feature             — Position duty
      {id}.requirement.feature      — Position skill requirement
      """

  Scenario: File content is Gherkin
    Given each file describes one concern as a Gherkin Feature
    Then the Feature title names the concern
    And Scenarios describe specific aspects
    And the content is what gets stored as node information in runtime

Feature: Example — Individual Prototype
  A minimal prototype that creates a single individual with skills.

  Scenario: Directory structure
    Given you want to create a developer role
    Then create this structure:
      """
      prototypes/dev/
      ├── resource.json
      ├── prototype.json
      ├── dev.individual.feature
      └── code-review.procedure.feature
      """

  Scenario: resource.json
    Then write:
      """json
      {
        "name": "dev",
        "type": "prototype",
        "author": "my-team",
        "description": "A developer role with code review skill"
      }
      """

  Scenario: prototype.json
    Then write:
      """json
      [
        { "op": "!individual.born", "args": { "id": "dev", "content": "@dev.individual.feature" } },
        { "op": "!individual.train", "args": { "individual": "dev", "id": "code-review", "content": "@code-review.procedure.feature" } }
      ]
      """

  Scenario: Settle the prototype
    Given the directory is ready
    When you run:
      """
      use("!prototype.settle", { source: "./prototypes/dev" })
      """
    Then the dev individual is born and trained with the code-review procedure

Feature: Example — Organization Prototype
  A prototype that creates individuals, an organization, positions, and appointments.

  Scenario: Instruction set pattern
    Given you want a full organization prototype
    Then prototype.json follows this pattern:
      """json
      [
        { "op": "!individual.born", "args": { "id": "alice", "content": "@alice.individual.feature" } },
        { "op": "!individual.train", "args": { "individual": "alice", "id": "design", "content": "@design.procedure.feature" } },

        { "op": "!org.found", "args": { "id": "my-org", "content": "@my-org.organization.feature" } },
        { "op": "!org.charter", "args": { "org": "my-org", "id": "charter", "content": "@charter.charter.feature" } },
        { "op": "!org.hire", "args": { "org": "my-org", "individual": "alice" } },

        { "op": "!position.establish", "args": { "id": "architect", "content": "@architect.position.feature" } },
        { "op": "!position.charge", "args": { "position": "architect", "id": "system-design", "content": "@system-design.duty.feature" } },
        { "op": "!position.require", "args": { "position": "architect", "id": "design", "content": "@design.requirement.feature" } },
        { "op": "!position.appoint", "args": { "position": "architect", "individual": "alice" } }
      ]
      """
