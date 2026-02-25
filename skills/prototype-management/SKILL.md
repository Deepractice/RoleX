---
name: prototype-management
description: Manage prototypes — registry (settle, evict, list) and creation (born, teach, train, found, charter, establish, charge, require). Use when you need to register, create, or inspect prototypes.
---

Feature: Prototype Registry
  Register, unregister, and list prototypes.
  A prototype is a pre-configured State template that merges with runtime state on activation.

  Scenario: settle — settle a prototype into the world
    Given you have a ResourceX source (local path or locator) containing a prototype
    When you call use with !prototype.settle
    Then the source is ingested to extract its id
    And the id → source mapping is stored in the prototype registry
    And parameters are:
      """
      use("!prototype.settle", { source: "/path/to/roles/nuwa" })
      """

  Scenario: evict — evict a prototype from the world
    Given a prototype is no longer needed
    When you call use with !prototype.evict
    Then the id is removed from the prototype registry
    And parameters are:
      """
      use("!prototype.evict", { id: "nuwa" })
      """

  Scenario: list — list all registered prototypes
    Given you want to see what prototypes are available
    When you call use with !prototype.list
    Then the id → source mapping of all registered prototypes is returned

Feature: Individual Prototype Creation
  Create individual prototype directories on the filesystem.

  Scenario: born — create an individual prototype
    Given you want to create a new role prototype
    When you call use with !prototype.born
    Then a directory is created with individual.json manifest
    And parameters are:
      """
      use("!prototype.born", {
        dir: "/path/to/my-role",
        content: "Feature: My Role\n  A backend engineer.",
        id: "my-role",
        alias: ["MyRole"]    // optional
      })
      """

  Scenario: teach — add a principle to a prototype
    Given an individual prototype exists
    When you call use with !prototype.teach
    Then a principle node is added to the manifest and feature file is written
    And parameters are:
      """
      use("!prototype.teach", {
        dir: "/path/to/my-role",
        content: "Feature: Always test first\n  Tests before code.",
        id: "tdd-first"
      })
      """

  Scenario: train — add a procedure to a prototype
    Given an individual prototype exists
    When you call use with !prototype.train
    Then a procedure node is added to the manifest and feature file is written
    And parameters are:
      """
      use("!prototype.train", {
        dir: "/path/to/my-role",
        content: "Feature: Code Review\n  https://example.com/skills/code-review",
        id: "code-review"
      })
      """

Feature: Organization Prototype Creation
  Create organization prototype directories on the filesystem.

  Scenario: found — create an organization prototype
    Given you want to create a new organization prototype
    When you call use with !prototype.found
    Then a directory is created with organization.json manifest
    And parameters are:
      """
      use("!prototype.found", {
        dir: "/path/to/my-org",
        content: "Feature: Deepractice\n  AI agent framework company.",
        id: "deepractice",
        alias: ["DP"]    // optional
      })
      """

  Scenario: charter — add a charter to an organization prototype
    Given an organization prototype exists
    When you call use with !prototype.charter
    Then a charter node is added to the manifest
    And parameters are:
      """
      use("!prototype.charter", {
        dir: "/path/to/my-org",
        content: "Feature: Build role-based AI\n  Scenario: Mission\n    Given AI needs identity",
        id: "mission"    // optional, defaults to "charter"
      })
      """

  Scenario: establish — add a position to an organization prototype
    Given an organization prototype exists
    When you call use with !prototype.establish
    Then a position node is added to the manifest with empty children
    And parameters are:
      """
      use("!prototype.establish", {
        dir: "/path/to/my-org",
        content: "Feature: Backend Architect\n  System design lead.",
        id: "architect"
      })
      """

  Scenario: charge — add a duty to a position in an organization prototype
    Given a position exists in the organization prototype
    When you call use with !prototype.charge
    Then a duty node is added under the position in the manifest
    And parameters are:
      """
      use("!prototype.charge", {
        dir: "/path/to/my-org",
        position: "architect",
        content: "Feature: Design APIs\n  Scenario: New service\n    Given a service is needed\n    Then design API first",
        id: "design-apis"
      })
      """

  Scenario: require — add a required skill to a position in an organization prototype
    Given a position exists in the organization prototype
    When you call use with !prototype.require
    Then a requirement node is added under the position in the manifest
    And when an individual is appointed to this position at runtime, the skill is auto-trained
    And parameters are:
      """
      use("!prototype.require", {
        dir: "/path/to/my-org",
        position: "architect",
        content: "Feature: System Design\n  Scenario: When to apply\n    Given architecture decisions needed\n    Then apply systematic design",
        id: "system-design"
      })
      """

Feature: Prototype Binding Rules
  How prototypes bind to runtime state.

  Scenario: Binding is by id
    Given a prototype has id "nuwa" (extracted from its manifest)
    Then on activate, the prototype state is resolved by the individual's id
    And one prototype binds to exactly one individual

  Scenario: Auto-born on activate
    Given a prototype is registered but no runtime individual exists
    When activate is called
    Then the individual is automatically born
    And the prototype state merges with the fresh instance

  Scenario: Prototype nodes are read-only
    Given a prototype is activated and merged with an instance
    Then prototype-origin nodes cannot be modified or forgotten
    And only instance-origin nodes are mutable

Feature: Common Workflows

  Scenario: Create and register an individual prototype
    Given you want a reusable role template
    Then follow this sequence:
      """
      1. use("!prototype.born", { dir: "./roles/dev", id: "dev", content: "Feature: Developer" })
      2. use("!prototype.teach", { dir: "./roles/dev", content: "Feature: TDD\n  ...", id: "tdd" })
      3. use("!prototype.train", { dir: "./roles/dev", content: "Feature: Review\n  ...", id: "review" })
      4. use("!prototype.settle", { source: "./roles/dev" })
      5. activate("dev")
      """

  Scenario: Create and register an organization prototype
    Given you want a reusable organization template
    Then follow this sequence:
      """
      1. use("!prototype.found", { dir: "./orgs/dp", id: "dp", content: "Feature: Deepractice" })
      2. use("!prototype.charter", { dir: "./orgs/dp", content: "Feature: Mission\n  ...", id: "mission" })
      3. use("!prototype.establish", { dir: "./orgs/dp", content: "Feature: Architect", id: "architect" })
      4. use("!prototype.charge", { dir: "./orgs/dp", position: "architect", content: "Feature: Design\n  ...", id: "design" })
      5. use("!prototype.require", { dir: "./orgs/dp", position: "architect", content: "Feature: Skill\n  ...", id: "skill" })
      6. use("!prototype.settle", { source: "./orgs/dp" })
      """
