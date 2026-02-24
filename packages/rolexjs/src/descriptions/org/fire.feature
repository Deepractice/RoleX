Feature: fire — remove from an organization
  Fire an individual from an organization.
  The individual is dismissed from all positions and removed from the organization.

  Scenario: Fire an individual
    Given an individual is a member of an organization
    When fire is called with the organization and individual
    Then the individual is dismissed from all positions
    And the individual is removed from the organization
