Feature: todo
  As a role, I create a concrete task to execute.

  Scenario: Create a task
    Given I have a focused goal with a plan
    When I call todo with a name and Gherkin task source
    Then the task is stored as a unit of work
    And it appears in my focus task list
