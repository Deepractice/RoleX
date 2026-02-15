Feature: todo — add a task to a plan
  A task is a concrete, actionable unit of work.
  Each task has Gherkin scenarios describing the steps and expected outcomes.

  Scenario: Create a task
    Given a focused plan exists
    And a Gherkin source describing the task
    When todo is called with the source
    Then a new task node is created under the plan
    And the task can be finished when completed

  Scenario: Writing the task Gherkin
    Given the task is a concrete, actionable unit of work
    Then the Feature title names what will be done — a single deliverable
    And Scenarios describe the steps and expected outcomes of the work
    And the tone is actionable — clear enough that someone can start immediately
