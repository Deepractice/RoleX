@rolex @owner @task
Feature: Implement activeGoal() and createGoal() and completeGoal()
  As the Rolex owner, I need goal lifecycle methods to find, create,
  and complete goals in the role's goals/ directory.

  Scenario: Find active goal
    Given a role directory with goals/ subdirectory
    And it contains goal directories with *.goal.feature files
    When I call rolex.activeGoal()
    Then it returns the first Goal whose feature has no @done tag
    And returns null if all goals have @done tag

  Scenario: Create a new goal
    Given a role directory
    When I call rolex.createGoal("new-feature")
    Then it creates goals/new-feature/ directory
    And writes a new-feature.goal.feature file
    And returns the created Goal

  Scenario: Complete active goal
    Given an active goal exists
    When I call rolex.completeGoal()
    Then it adds @done tag to the active goal's .goal.feature file
    And the goal no longer appears in activeGoal()
