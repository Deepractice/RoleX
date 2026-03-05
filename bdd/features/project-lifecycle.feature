@project
Feature: Project lifecycle
  Launch, scope, milestone, enroll, deliver, wiki, archive.

  Background:
    Given a fresh Rolex instance

  # ===== launch =====

  Scenario: Launch creates a project
    When I direct "!project.launch" with:
      | content | Feature: RoleX v2 |
      | id      | rolex-v2          |
    Then the result process should be "launch"
    And the result state name should be "project"
    And the result state id should be "rolex-v2"

  Scenario: Launch creates a project owned by an organization
    Given organization "deepractice" exists
    When I direct "!project.launch" with:
      | content | Feature: RoleX v2 |
      | id      | rolex-v2-org      |
      | org     | deepractice       |
    Then the result process should be "launch"
    And the result state id should be "rolex-v2-org"
    And the result state should have link "ownership" to "deepractice"

  # ===== scope =====

  Scenario: Scope defines project boundary
    Given project "rolex-v2" exists
    When I direct "!project.scope" with:
      | project | rolex-v2                              |
      | content | Feature: Add Project primitive to RoleX |
      | id      | rolex-v2-scope                        |
    Then the result process should be "scope"
    And the result state name should be "scope"

  # ===== milestone =====

  Scenario: Milestone adds a checkpoint to project
    Given project "rolex-v2" exists
    When I direct "!project.milestone" with:
      | project | rolex-v2                          |
      | content | Feature: Core structures complete  |
      | id      | core-done                         |
    Then the result process should be "milestone"
    And the result state name should be "milestone"

  Scenario: Achieve marks a milestone as done
    Given project "rolex-v2" exists
    And milestone "core-done" exists in project "rolex-v2"
    When I direct "!project.achieve" with:
      | milestone | core-done |
    Then the result process should be "achieve"

  # ===== enroll / remove =====

  Scenario: Enroll adds individual to project
    Given individual "sean" exists
    And project "rolex-v2" exists
    When I direct "!project.enroll" with:
      | project    | rolex-v2 |
      | individual | sean     |
    Then the result process should be "enroll"

  Scenario: Remove removes individual from project
    Given individual "sean" exists
    And project "rolex-v2" exists
    And "sean" is enrolled in "rolex-v2"
    When I direct "!project.remove" with:
      | project    | rolex-v2 |
      | individual | sean     |
    Then the result process should be "remove"

  # ===== deliver =====

  Scenario: Deliver adds a deliverable to project
    Given project "rolex-v2" exists
    When I direct "!project.deliver" with:
      | project | rolex-v2                                |
      | content | Feature: @rolexjs/core v2.0.0 published |
      | id      | core-v2-release                         |
    Then the result process should be "deliver"
    And the result state name should be "deliverable"

  # ===== wiki =====

  Scenario: Wiki adds a knowledge entry to project
    Given project "rolex-v2" exists
    When I direct "!project.wiki" with:
      | project | rolex-v2                                       |
      | content | Feature: Tech debt - parser needs refactoring  |
      | id      | parser-tech-debt                               |
    Then the result process should be "wiki"
    And the result state name should be "wiki"

  # ===== archive =====

  Scenario: Archive moves project to past
    Given project "rolex-v2" exists
    When I direct "!project.archive" with:
      | project | rolex-v2 |
    Then the result process should be "archive"
    And the result state name should be "project"
