Feature: abandon — abandon a goal
  Mark a goal as dropped and create an encounter.
  Call this when a goal is no longer viable. Even failed goals produce learning.

  Scenario: Abandon a goal
    Given a focused goal exists
    And the goal is no longer viable
    When abandon is called
    Then the goal is marked abandoned
    And an encounter is created under the role
    And the encounter can be reflected on — failure is also learning
