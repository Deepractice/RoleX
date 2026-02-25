Feature: abandon — abandon a plan
  Mark a plan as dropped and create an encounter.
  Call this when a plan's strategy is no longer viable. Even failed plans produce learning.

  Scenario: Abandon a plan
    Given a focused plan exists
    And the plan's strategy is no longer viable
    When abandon is called
    Then the plan is tagged #abandoned and stays in the tree
    And an encounter is created under the role
    And the encounter can be reflected on — failure is also learning

  Scenario: Writing the encounter Gherkin
    Given the encounter records what happened — even failure is a raw experience
    Then the Feature title describes what was attempted and why it was abandoned
    And Scenarios capture what was tried, what went wrong, and what was learned
    And the tone is concrete and honest — failure produces the richest encounters
