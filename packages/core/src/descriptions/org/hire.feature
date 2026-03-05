Feature: hire — hire into an organization
  Hire an individual into an organization as a member.
  Members can then be appointed to positions.

  Scenario: Hire an individual
    Given an organization and an individual exist
    When hire is called with the organization and individual
    Then the individual becomes a member of the organization
    And the individual can be appointed to positions within the organization
