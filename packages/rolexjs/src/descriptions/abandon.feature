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

  Scenario: Writing the encounter Gherkin
    Given the encounter records what happened — even failure is a raw experience
    Then the Feature title describes what was attempted and why it was abandoned
    And Scenarios capture what was tried, what went wrong, and what was learned
    And the tone is concrete and honest — failure produces the richest encounters
