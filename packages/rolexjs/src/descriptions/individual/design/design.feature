Feature: design
  As a role, I design a plan for my current goal.

  Scenario: Create a plan
    Given I have a focused goal
    When I call design with Gherkin plan source
    Then the plan is stored under my focused goal
    And the plan breaks the goal into logical phases
