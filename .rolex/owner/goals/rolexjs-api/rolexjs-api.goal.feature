@rolex @owner @goal
Feature: Design the public API for rolexjs
  As the Rolex owner, I need a flow-oriented API on the Rolex class
  so AI agents follow a natural cascading process:
  Cognition → Goal → Plan → Task, one level at a time.

  Scenario: Rolex provides a flow-oriented API
    Given a Rolex instance is initialized with a role directory
    Then it exposes these methods:
      | method          | returns        | purpose                        |
      | cognition()     | Feature[]      | Load all cognition (auto)      |
      | activeGoal()    | Goal or null   | Current active goal            |
      | createGoal(...) | Goal           | Create a new goal              |
      | completeGoal()  | void           | Mark current goal as done      |
      | activePlan()    | Plan or null   | Current goal's plan            |
      | createPlan(...) | Plan           | Create plan for current goal   |
      | activeTask()    | Task or null   | Current in-progress task       |
      | createTask(...) | Task           | Add task to current plan       |
      | completeTask()  | void           | Mark current task as done      |
    And each method is a single action — no chaining needed
    And activeXxx is query, createXxx is create, completeXxx is close

  Scenario: AI agent follows the cascading flow
    Given an AI agent starts with a role
    Then the flow is:
      | step | check             | if null            | if present       |
      | 1    | cognition()       | —                  | load as context  |
      | 2    | activeGoal()      | ask user for goal  | proceed to plan  |
      | 3    | activePlan()      | design a plan      | proceed to task  |
      | 4    | activeTask()      | break down tasks   | execute task     |
    And cognition is always loaded — it is the system prompt
    And each level resolves before descending to the next

  Scenario: All dimensions are Gherkin Features
    Given every dimension is stored as a .feature file
    Then the Rolex API operates on Feature objects throughout
    And the naming convention determines the dimension:
      | pattern                | dimension  |
      | *.cognition.feature    | Cognition  |
      | *.goal.feature         | Goal       |
      | *.plan.feature         | Plan       |
      | *.task.feature         | Task       |

  Scenario: Verify rolexjs is the single entry point
    Given @rolexjs/core defines interfaces
    And @rolexjs/parser handles Gherkin parsing
    Then rolexjs re-exports types and provides the Rolex class
    And consumers only need to depend on rolexjs
