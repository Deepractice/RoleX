Feature: focus
  As a role, I check or switch my current goal focus.

  Scenario: Check current focus
    Given I have an active identity
    When I call focus without a name
    Then I see my current goal with its full Gherkin content
    And I see all plans for this goal with their full content
    And I see tasks for the focused plan with their full content
    And I see a list of other active goals

  Scenario: Switch focus
    Given I have multiple active goals
    When I call focus with a goal name
    Then that goal becomes my current focus
    And subsequent operations target the new goal
