Feature: activate — enter a role
  Project the individual's full state including identity, knowledge, goals,
  and organizational context. This is the entry point for working as a role.

  Scenario: Activate an individual
    Given an individual exists in society
    When activate is called with the individual reference
    Then the full state tree is projected
    And identity, knowledge, goals, and organizational context are loaded
    And the individual becomes the active role
