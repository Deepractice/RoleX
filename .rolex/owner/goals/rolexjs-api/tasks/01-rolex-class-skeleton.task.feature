@rolex @owner @task
Feature: Create Rolex class skeleton with method signatures
  As the Rolex owner, I need the Rolex class defined in rolexjs
  with all method signatures, so subsequent tasks can implement them one by one.

  Scenario: Define Rolex class in rolexjs package
    Given rolexjs is the consumer-facing package
    When I create the Rolex class
    Then it has a constructor that takes a role directory path
    And it exposes these methods (initially throwing "not implemented"):
      | method          | signature                      |
      | cognition()     | () => Feature[]                |
      | activeGoal()    | () => Goal | null              |
      | createGoal()    | (name: string) => Goal         |
      | completeGoal()  | () => void                     |
      | activePlan()    | () => Plan | null              |
      | createPlan()    | (feature: Feature) => Plan     |
      | activeTask()    | () => Task | null              |
      | createTask()    | (name: string) => Task         |
      | completeTask()  | () => void                     |
