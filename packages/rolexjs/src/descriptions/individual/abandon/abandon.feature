Feature: abandon
  As a role, I abandon my current goal.

  Scenario: Abandon a goal
    Given my focused goal is no longer viable
    When I call abandon
    Then the goal is marked @abandoned

  Scenario: Abandon with conclusion
    Given I want to record why the goal was abandoned
    When I call abandon with a conclusion (Gherkin source)
    Then the goal is marked @abandoned
    And the conclusion records why it was abandoned

  Scenario: Abandon with experience
    Given I learned something from this failed pursuit
    When I call abandon with an experience name and Gherkin source
    Then the goal is marked @abandoned
    And the experience is distilled into my identity
