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
