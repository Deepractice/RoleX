Feature: achieve
  As a role, I mark my current goal as achieved.

  Scenario: Achieve a goal
    Given my focused goal has been fulfilled
    When I call achieve
    Then the goal is marked @done

  Scenario: Achieve with experience
    Given I learned something from achieving this goal
    When I call achieve with an experience name and Gherkin source
    Then the goal is marked @done
    And the experience is synthesized into my identity
