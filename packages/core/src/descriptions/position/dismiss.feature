Feature: dismiss — remove from a position
  Dismiss an individual from a position.
  The individual remains a member of the organization.

  Scenario: Dismiss an individual
    Given an individual holds a position
    When dismiss is called with the position and individual
    Then the individual no longer holds the position
    And the individual remains a member of the organization
    And the position is now vacant

  Scenario: Parameters
    Given the command is position.dismiss
    Then position is required — the position's id
    And individual is required — the individual's id
