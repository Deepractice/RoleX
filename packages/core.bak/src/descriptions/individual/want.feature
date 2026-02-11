Feature: want
  As a role, I declare a new goal I want to achieve.

  Scenario: Declare a goal
    Given I have an active identity
    When I call want with a name and Gherkin goal source
    Then the goal is stored under my role
    And I automatically focus on this new goal
