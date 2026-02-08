@rolex @owner @task
Feature: Implement activePlan() and createPlan()
  As the Rolex owner, I need plan methods to find and create
  the plan for the current active goal.

  Scenario: Find active plan
    Given an active goal exists
    And its directory contains a *.plan.feature file
    When I call rolex.activePlan()
    Then it returns the Plan parsed from that file
    And returns null if no plan file exists

  Scenario: Create a plan
    Given an active goal exists with no plan
    When I call rolex.createPlan(feature)
    Then it writes a *.plan.feature file in the goal directory
    And returns the created Plan
