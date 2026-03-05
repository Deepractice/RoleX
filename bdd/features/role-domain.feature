@role-domain
Feature: Role as rich domain model
  Role is a self-contained stateful entity that holds its own state projection
  and exposes domain behaviors. Internal state (cursors, cognitive registries)
  is not exposed — only domain methods.

  Background:
    Given a fresh Rolex instance
    And individual "sean" exists
    And I activate role "sean"

  # ===== Role boundary =====

  Scenario: Role knows its own boundary
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I todo "login" with "Feature: Login"
    Then role "sean" should contain node "auth"
    And role "sean" should contain node "jwt"
    And role "sean" should contain node "login"

  # ===== serialization =====

  Scenario: Role serializes cursor and cognitive state
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I todo "login" with "Feature: Login"
    And I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    When I serialize the role
    Then the snapshot should contain focusedGoalId "auth"
    And the snapshot should contain focusedPlanId "jwt"
    And the snapshot should contain encounter "login-finished"

  Scenario: Role restores from snapshot and state projection
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I serialize the role
    When I restore the role from snapshot with fresh state projection
    Then focusedGoalId should be "auth"
    And focusedPlanId should be "jwt"
    And focus without args should return "auth"
