@context-persistence
Feature: Activate focus restoration
  activate should restore focus from persisted context,
  but when persisted focus is null or invalid, it should
  preserve the rehydrated default from the state tree.

  Background:
    Given a fresh Rolex instance

  Scenario: Persisted null should not override rehydrated focus
    Given an individual "sean" with goal "auth"
    And persisted focusedGoalId is null
    When I activate "sean"
    Then focusedGoalId should be "auth"

  Scenario: Valid persisted focus takes priority over rehydrate
    Given an individual "sean" with goals "auth" and "deploy"
    And persisted focusedGoalId is "deploy"
    When I activate "sean"
    Then focusedGoalId should be "deploy"

  Scenario: No persisted context falls back to rehydrate default
    Given an individual "sean" with goal "auth"
    And no persisted context exists
    When I activate "sean"
    Then focusedGoalId should be "auth"
