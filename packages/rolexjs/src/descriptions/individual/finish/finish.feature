Feature: finish
  As a role, I mark a task as complete.

  Scenario: Finish a task
    Given I have an active task
    When I call finish with the task name
    Then the task is marked @done

  Scenario: Finish with conclusion
    Given I completed a task and want to summarize what happened
    When I call finish with a conclusion (Gherkin source)
    Then the task is marked @done
    And the conclusion is stored as a completion summary
