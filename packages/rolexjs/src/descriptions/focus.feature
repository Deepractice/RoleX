Feature: focus — view or switch focused goal
  View the current goal's state, or switch focus to a different goal.
  Subsequent plan and todo operations target the focused goal.

  Scenario: View current goal
    Given an active goal exists
    When focus is called without a name
    Then the current goal's state tree is projected
    And plans and tasks under the goal are visible

  Scenario: Switch focus
    Given multiple goals exist
    When focus is called with a goal name
    Then the focused goal switches to the named goal
    And subsequent plan and todo operations target this goal
