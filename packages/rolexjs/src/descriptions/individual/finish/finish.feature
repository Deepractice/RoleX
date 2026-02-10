Feature: finish
  As a role, I mark a task as complete.

  Scenario: Finish a task
    Given I have an active task
    When I call finish with the task name
    Then the task is marked @done

  Scenario: Finish with experience
    Given I learned something while completing a task
    When I call finish with an experience name and Gherkin source
    Then the task is marked @done
    And the experience is synthesized into my identity
