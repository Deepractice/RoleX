@rolex @owner @plan
Feature: Implementation plan for rolexjs API
  As the Rolex owner, I plan to implement the Rolex class API
  through BDD-driven tasks, building from bottom up:
  filesystem → parsing → API methods.

  Scenario: Plan overview — bottom-up implementation
    Given the Rolex API operates on .feature files
    And it needs to read from local filesystem
    And it needs to parse Gherkin into Feature objects
    Then the implementation order is:
      | order | task                  | delivers                          |
      | 1     | Rolex class skeleton  | Class with method signatures      |
      | 2     | cognition()           | Load *.cognition.feature → Feature[] |
      | 3     | activeGoal()          | Find active *.goal.feature        |
      | 4     | createGoal()          | Write new *.goal.feature          |
      | 5     | completeGoal()        | Mark goal @done                   |
      | 6     | activePlan()          | Find *.plan.feature in goal dir   |
      | 7     | createPlan()          | Write *.plan.feature              |
      | 8     | activeTask()          | Find active *.task.feature        |
      | 9     | createTask()          | Write *.task.feature              |
      | 10    | completeTask()        | Mark task @done                   |
    And each task is driven by BDD tests first
    And local filesystem operations are built inline — no separate package needed

  Scenario: Active vs Done is determined by @done tag
    Given Gherkin supports tags on Features
    Then the convention is:
      | tag    | meaning                          |
      | @done  | This goal/task has been completed |
      | (none) | This goal/task is active/pending  |
    And activeGoal() returns the first goal Feature without @done
    And activeTask() returns the first task Feature without @done
    And completeGoal() adds @done tag to the goal Feature file
