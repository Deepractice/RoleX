Feature: Position Management
  position-management

  Scenario: When to use this skill
    Given I need to manage positions (establish, charge, abolish)
    And I need to manage appointments (appoint, dismiss)
    When the operation involves creating roles, assigning duties, or staffing positions
    Then load this skill for detailed instructions
