Feature: complete — complete a plan
  Mark a plan as done and create an encounter.
  Call this when all tasks in the plan are finished and the strategy succeeded.

  Scenario: Complete a plan
    Given a focused plan exists
    And its tasks are done
    When complete is called
    Then the plan is tagged #done and stays in the tree
    And an encounter is created under the role
    And the encounter can be reflected on for learning

  Scenario: Writing the encounter Gherkin
    Given the encounter records what happened — a raw account of the experience
    Then the Feature title describes what was accomplished by this plan
    And Scenarios capture what the strategy was, what worked, and what resulted
    And the tone is concrete and specific — tied to this particular plan
