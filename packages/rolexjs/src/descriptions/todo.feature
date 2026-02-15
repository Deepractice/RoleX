Feature: todo — add a task to a plan
  A task is a concrete, actionable unit of work.
  Each task has Gherkin scenarios describing the steps and expected outcomes.

  Scenario: Create a task
    Given a focused plan exists
    And a Gherkin source describing the task
    When todo is called with the source
    Then a new task node is created under the plan
    And the task can be finished when completed
