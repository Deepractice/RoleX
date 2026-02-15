Feature: achieve — achieve a goal
  Mark a goal as done and create an encounter.
  Call this when the goal's success criteria are met.

  Scenario: Achieve a goal
    Given a focused goal exists
    And its success criteria are met
    When achieve is called
    Then the goal is marked done
    And an encounter is created under the role
    And the encounter can be reflected on for learning
