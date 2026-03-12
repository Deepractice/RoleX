@rolex-world
Feature: RoleX as world entry point
  RoleX is the runtime that manages Role lifecycle and world-level operations.
  activate produces a Role instance. direct executes world-level commands.

  Background:
    Given a fresh Rolex instance

  # ===== activate =====

  Scenario: Activate returns a Role instance
    Given individual "sean" exists
    When I activate role "sean"
    Then I should receive a Role with id "sean"

  Scenario: Activate same individual returns same instance
    Given individual "sean" exists
    When I activate role "sean"
    And I activate role "sean" again
    Then both activations should return the same Role instance

  Scenario: Activate non-existent individual fails
    When I try to activate role "unknown"
    Then it should fail with "not found"

  # ===== direct =====

  Scenario: Direct executes world-level commands
    When I direct "!society.born" with:
      | id      | alice          |
      | content | Feature: Alice |
    Then individual "alice" should exist

  Scenario: Direct does not require an active Role
    Given individual "sean" exists
    When I direct "!survey.list" with:
      | type | individual |
    Then the direct result should contain "sean"
