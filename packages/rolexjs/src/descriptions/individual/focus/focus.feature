Feature: focus
  As a role, I check or switch my current goal focus.

  Scenario: Check current focus
    Given I have an active identity
    When I call focus without a name
    Then I see my current goal with its plan and tasks
    And I see a list of other active goals

  Scenario: Switch focus
    Given I have multiple active goals
    When I call focus with a goal name
    Then that goal becomes my current focus
    And subsequent operations target the new goal
