Feature: design
  As a role, I design a plan for my current goal.

  Scenario: Create a plan
    Given I have a focused goal
    When I call design with a name and Gherkin plan source
    Then the plan is stored under my focused goal
    And the plan breaks the goal into logical phases
    And this plan becomes the focused plan for the goal

  Scenario: Multiple plans
    Given I have a focused goal with an existing plan
    When I call design with a different name
    Then a second plan is created under the same goal
    And the new plan becomes the focused plan
    And the previous plan remains accessible
