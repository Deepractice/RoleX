Feature: plan — create a plan for a goal
  Break a goal into logical phases or stages.
  Each phase is described as a Gherkin scenario. Tasks are created under the plan.

  Scenario: Create a plan
    Given a focused goal exists
    And a Gherkin source describing the plan phases
    When plan is called with the source
    Then a new plan node is created under the goal
    And the plan becomes the focused plan
    And tasks can be added to this plan with todo

  Scenario: Writing the plan Gherkin
    Given the plan breaks a goal into logical phases
    Then the Feature title names the overall approach or strategy
    And Scenarios represent distinct phases — each phase is a stage of execution
    And the tone is structural — ordering and grouping work, not detailing steps
