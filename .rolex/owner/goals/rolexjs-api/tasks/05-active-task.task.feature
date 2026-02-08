@rolex @owner @task
Feature: Implement activeTask() and createTask() and completeTask()
  As the Rolex owner, I need task lifecycle methods to find, create,
  and complete tasks in the current goal's tasks/ directory.

  Scenario: Find active task
    Given an active goal with a plan
    And the goal directory has tasks/ with *.task.feature files
    When I call rolex.activeTask()
    Then it returns the first Task whose feature has no @done tag
    And returns null if all tasks have @done or no tasks exist

  Scenario: Create a new task
    Given an active goal with a plan
    When I call rolex.createTask("implement-loader")
    Then it creates a tasks/implement-loader.task.feature file
    And returns the created Task

  Scenario: Complete active task
    Given an active task exists
    When I call rolex.completeTask()
    Then it adds @done tag to the active task's .task.feature file
    And the task no longer appears in activeTask()
