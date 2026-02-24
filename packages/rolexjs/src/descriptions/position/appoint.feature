Feature: appoint — assign to a position
  Appoint an individual to a position.
  The individual must be a member of the organization.

  Scenario: Appoint an individual
    Given an individual is a member of an organization
    And a position exists within the organization
    When appoint is called with the position and individual
    Then the individual holds the position
    And the individual inherits the position's duties
