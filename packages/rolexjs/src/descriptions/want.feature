Feature: want — declare a goal
  Declare a new goal for a role.
  A goal describes a desired outcome with Gherkin scenarios as success criteria.

  Scenario: Declare a goal
    Given an active role exists
    And a Gherkin source describing the desired outcome
    When want is called with the source
    Then a new goal node is created under the role
    And the goal becomes the current focus
    And subsequent plan and todo operations target this goal

  Scenario: Writing the goal Gherkin
    Given the goal describes a desired outcome — what success looks like
    Then the Feature title names the outcome in concrete terms
    And Scenarios define success criteria — each scenario is a testable condition
    And the tone is aspirational but specific — "users can log in" not "improve auth"
